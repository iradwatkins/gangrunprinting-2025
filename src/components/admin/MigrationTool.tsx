import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MigrationStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  sql?: string;
}

export function MigrationTool() {
  const [steps, setSteps] = useState<MigrationStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateStep = (name: string, status: MigrationStep['status'], message?: string) => {
    setSteps(prev => {
      const existing = prev.find(s => s.name === name);
      if (existing) {
        return prev.map(s => s.name === name ? { ...s, status, message } : s);
      }
      return [...prev, { name, status, message }];
    });
  };

  const executeMigration = async () => {
    setIsRunning(true);
    setSteps([]);

    try {
      // Step 1: Check current table structure
      updateStep('Schema Analysis', 'running');
      
      const { data: currentData, error: currentError } = await supabase
        .from('quantities')
        .select('*')
        .limit(1);

      if (currentError) {
        if (currentError.message.includes('relation') && currentError.message.includes('does not exist')) {
          updateStep('Schema Analysis', 'error', 'Quantities table does not exist - need to create it');
          setIsRunning(false);
          return;
        } else {
          updateStep('Schema Analysis', 'error', `Error accessing table: ${currentError.message}`);
          setIsRunning(false);
          return;
        }
      }

      // Check if we have old or new schema
      const sampleRecord = currentData?.[0];
      const hasOldSchema = sampleRecord && 'value' in sampleRecord && 'is_custom' in sampleRecord;
      const hasNewSchema = sampleRecord && 'values' in sampleRecord && 'has_custom' in sampleRecord;

      if (hasNewSchema) {
        updateStep('Schema Analysis', 'success', 'New schema already in place - no migration needed');
        setIsRunning(false);
        return;
      }

      if (hasOldSchema) {
        updateStep('Schema Analysis', 'success', 'Old schema detected - proceeding with migration');
      } else {
        updateStep('Schema Analysis', 'success', 'Empty table detected - applying new schema');
      }

      // Step 2: Add new columns
      updateStep('Add New Columns', 'running');
      
      try {
        // We need to execute these as separate SQL statements
        // First, try to add the columns (will fail if they already exist, but that's OK)
        const addColumnsSQL = `
          ALTER TABLE public.quantities 
          ADD COLUMN IF NOT EXISTS values TEXT,
          ADD COLUMN IF NOT EXISTS default_value INTEGER,
          ADD COLUMN IF NOT EXISTS has_custom BOOLEAN DEFAULT false;
        `;

        // We can't execute raw SQL directly through supabase client, so let's try a different approach
        // Create test records to see what works
        const testInsert = {
          name: 'MIGRATION_TEST_' + Date.now(),
          values: '1,2,3',
          default_value: 1,
          has_custom: false,
          is_active: false
        };

        const { data: testData, error: testError } = await supabase
          .from('quantities')
          .insert(testInsert)
          .select()
          .single();

        if (testError) {
          if (testError.message.includes('column') && testError.message.includes('does not exist')) {
            updateStep('Add New Columns', 'error', 'New columns do not exist. Please apply migration manually in Supabase dashboard.');
            setIsRunning(false);
            return;
          } else {
            updateStep('Add New Columns', 'error', `Column test failed: ${testError.message}`);
            setIsRunning(false);
            return;
          }
        }

        // If we got here, the new columns exist
        updateStep('Add New Columns', 'success', 'New columns are available');

        // Clean up test data
        if (testData?.id) {
          await supabase.from('quantities').delete().eq('id', testData.id);
        }

      } catch (error) {
        updateStep('Add New Columns', 'error', (error as Error).message);
        setIsRunning(false);
        return;
      }

      // Step 3: Migrate existing data (if any)
      if (hasOldSchema && currentData && currentData.length > 0) {
        updateStep('Migrate Data', 'running');
        
        try {
          // Get all existing records
          const { data: allRecords, error: fetchError } = await supabase
            .from('quantities')
            .select('*');

          if (fetchError) {
            updateStep('Migrate Data', 'error', `Failed to fetch existing data: ${fetchError.message}`);
            setIsRunning(false);
            return;
          }

          let migratedCount = 0;
          for (const record of allRecords || []) {
            if (record.values === null || record.values === undefined) {
              // This record needs migration
              const updatedRecord = {
                values: record.is_custom ? 'custom' : String(record.value),
                default_value: record.is_custom ? null : record.value,
                has_custom: record.is_custom
              };

              const { error: updateError } = await supabase
                .from('quantities')
                .update(updatedRecord)
                .eq('id', record.id);

              if (updateError) {
                updateStep('Migrate Data', 'error', `Failed to migrate record ${record.id}: ${updateError.message}`);
                setIsRunning(false);
                return;
              }
              migratedCount++;
            }
          }

          updateStep('Migrate Data', 'success', `Migrated ${migratedCount} existing records`);
        } catch (error) {
          updateStep('Migrate Data', 'error', (error as Error).message);
          setIsRunning(false);
          return;
        }
      } else {
        updateStep('Migrate Data', 'success', 'No existing data to migrate');
      }

      // Step 4: Create default quantity groups
      updateStep('Create Defaults', 'running');
      
      try {
        const defaultGroups = [
          {
            name: 'Small Orders',
            values: '1,2,3,4,5,6,7,8,9,10,custom',
            default_value: 5,
            has_custom: true,
            is_active: true
          },
          {
            name: 'Standard Print Runs',
            values: '25,50,100,250,500,custom',
            default_value: 100,
            has_custom: true,
            is_active: true
          },
          {
            name: 'Bulk Orders',
            values: '1000,2500,5000,10000,custom',
            default_value: 1000,
            has_custom: true,
            is_active: true
          },
          {
            name: 'Business Cards',
            values: '250,500,1000,2500,5000',
            default_value: 500,
            has_custom: false,
            is_active: true
          },
          {
            name: 'Postcards',
            values: '100,250,500,1000,2500,5000',
            default_value: 500,
            has_custom: false,
            is_active: true
          }
        ];

        let createdCount = 0;
        for (const group of defaultGroups) {
          // Check if group already exists
          const { data: existing } = await supabase
            .from('quantities')
            .select('id')
            .eq('name', group.name)
            .single();

          if (!existing) {
            const { error: createError } = await supabase
              .from('quantities')
              .insert(group);

            if (createError) {
              updateStep('Create Defaults', 'error', `Failed to create ${group.name}: ${createError.message}`);
              setIsRunning(false);
              return;
            }
            createdCount++;
          }
        }

        updateStep('Create Defaults', 'success', `Created ${createdCount} default quantity groups`);
      } catch (error) {
        updateStep('Create Defaults', 'error', (error as Error).message);
        setIsRunning(false);
        return;
      }

      // Step 5: Final validation
      updateStep('Validation', 'running');
      
      try {
        const { data: finalData, error: finalError } = await supabase
          .from('quantities')
          .select('*')
          .order('name');

        if (finalError) {
          updateStep('Validation', 'error', `Validation failed: ${finalError.message}`);
        } else {
          updateStep('Validation', 'success', `Migration completed successfully! Found ${finalData?.length || 0} quantity groups`);
        }
      } catch (error) {
        updateStep('Validation', 'error', (error as Error).message);
      }

    } catch (error) {
      updateStep('Migration Error', 'error', (error as Error).message);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: MigrationStep['status']) => {
    switch (status) {
      case 'running': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Database className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: MigrationStep['status']) => {
    switch (status) {
      case 'running': return <Badge variant="secondary">Running</Badge>;
      case 'success': return <Badge className="bg-green-500">Success</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Migration Tool
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This tool will migrate the quantities table from individual quantities to quantity groups.
              <strong> Run diagnostics first to understand the current state.</strong>
            </AlertDescription>
          </Alert>

          <Button onClick={executeMigration} disabled={isRunning} variant="outline">
            {isRunning ? 'Running Migration...' : 'Execute Migration'}
          </Button>
          
          {steps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Migration Progress:</h4>
              {steps.map((step, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(step.status)}
                    <span className="font-medium">{step.name}</span>
                  </div>
                  {getStatusBadge(step.status)}
                </div>
              ))}
              
              {steps.map((step, index) => (
                step.message && (
                  <div key={`${index}-message`} className="text-sm text-gray-600 ml-6">
                    {step.message}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}