import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { EmailAutomation, AutomationTrigger, AutomationAction, AutomationCondition, EmailTemplate } from '../../types/email';
import { emailTemplateApi } from '../../api/email';
import { 
  Plus, 
  Trash2, 
  Play, 
  Clock, 
  Mail, 
  Tag, 
  Users,
  Filter,
  ArrowDown,
  Settings
} from 'lucide-react';

interface AutomationBuilderProps {
  automation?: EmailAutomation;
  onSave: (automation: Partial<EmailAutomation>) => void;
  onCancel: () => void;
}

const TRIGGER_TYPES = [
  { value: 'order_created', label: 'Order Created' },
  { value: 'order_shipped', label: 'Order Shipped' },
  { value: 'cart_abandoned', label: 'Cart Abandoned' },
  { value: 'user_registered', label: 'User Registered' },
  { value: 'date_based', label: 'Date Based' },
];

const ACTION_TYPES = [
  { value: 'send_email', label: 'Send Email' },
  { value: 'add_tag', label: 'Add Tag' },
  { value: 'update_segment', label: 'Update Segment' },
  { value: 'wait', label: 'Wait' },
];

const CONDITION_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'in', label: 'In List' },
  { value: 'not_in', label: 'Not In List' },
];

const AutomationBuilder: React.FC<AutomationBuilderProps> = ({ automation, onSave, onCancel }) => {
  const [automationData, setAutomationData] = useState({
    name: automation?.name || '',
    description: automation?.description || '',
    trigger: automation?.trigger || {
      type: 'order_created' as const,
      config: {},
    },
    conditions: automation?.conditions || [],
    actions: automation?.actions || [],
    is_active: automation?.is_active || false,
  });

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await emailTemplateApi.getTemplates({ active: true });
      setTemplates(response.templates);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const addCondition = () => {
    setAutomationData(prev => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          field: 'email',
          operator: 'exists' as const,
          value: '',
        }
      ]
    }));
  };

  const removeCondition = (index: number) => {
    setAutomationData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const updateCondition = (index: number, updates: Partial<AutomationCondition>) => {
    setAutomationData(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, ...updates } : condition
      )
    }));
  };

  const addAction = () => {
    setAutomationData(prev => ({
      ...prev,
      actions: [
        ...prev.actions,
        {
          type: 'send_email' as const,
          config: {},
        }
      ]
    }));
  };

  const removeAction = (index: number) => {
    setAutomationData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const updateAction = (index: number, updates: Partial<AutomationAction>) => {
    setAutomationData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, ...updates } : action
      )
    }));
  };

  const updateTrigger = (updates: Partial<AutomationTrigger>) => {
    setAutomationData(prev => ({
      ...prev,
      trigger: { ...prev.trigger, ...updates }
    }));
  };

  const handleSave = () => {
    if (!automationData.name.trim()) {
      alert('Please enter an automation name');
      return;
    }

    if (automationData.actions.length === 0) {
      alert('Please add at least one action');
      return;
    }

    onSave(automationData);
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_email': return <Mail size={16} />;
      case 'add_tag': return <Tag size={16} />;
      case 'update_segment': return <Users size={16} />;
      case 'wait': return <Clock size={16} />;
      default: return <Settings size={16} />;
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'order_created': return '🛒';
      case 'order_shipped': return '📦';
      case 'cart_abandoned': return '⏰';
      case 'user_registered': return '👤';
      case 'date_based': return '📅';
      default: return '⚡';
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Details</CardTitle>
          <CardDescription>Set up your email automation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Automation Name</Label>
              <Input
                id="name"
                value={automationData.name}
                onChange={(e) => setAutomationData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter automation name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={automationData.is_active}
                onChange={(e) => setAutomationData(prev => ({ ...prev, is_active: e.target.checked }))}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={automationData.description}
              onChange={(e) => setAutomationData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter automation description"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play size={20} className="text-green-600" />
            Trigger
          </CardTitle>
          <CardDescription>What event should start this automation?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Trigger Type</Label>
              <Select
                value={automationData.trigger.type}
                onValueChange={(value) => updateTrigger({ type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <span>{getTriggerIcon(type.value)}</span>
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {automationData.trigger.type === 'cart_abandoned' && (
              <div>
                <Label>Delay (hours)</Label>
                <Input
                  type="number"
                  value={automationData.trigger.config.delay_hours || 24}
                  onChange={(e) => updateTrigger({
                    config: { ...automationData.trigger.config, delay_hours: parseInt(e.target.value) }
                  })}
                  placeholder="24"
                />
              </div>
            )}
            
            {automationData.trigger.type === 'date_based' && (
              <div>
                <Label>Schedule</Label>
                <Select
                  value={automationData.trigger.config.schedule || 'daily'}
                  onValueChange={(value) => updateTrigger({
                    config: { ...automationData.trigger.config, schedule: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conditions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter size={20} className="text-blue-600" />
                Conditions
              </CardTitle>
              <CardDescription>Optional conditions to refine when this automation runs</CardDescription>
            </div>
            <Button onClick={addCondition} size="sm" variant="outline">
              <Plus size={16} className="mr-1" />
              Add Condition
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {automationData.conditions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Filter size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No conditions set. This automation will run for all matching triggers.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {automationData.conditions.map((condition, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Condition {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Field</Label>
                      <Input
                        value={condition.field}
                        onChange={(e) => updateCondition(index, { field: e.target.value })}
                        placeholder="customer.total_orders"
                      />
                    </div>
                    <div>
                      <Label>Operator</Label>
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(index, { operator: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_OPERATORS.map(op => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input
                        value={condition.value}
                        onChange={(e) => updateCondition(index, { value: e.target.value })}
                        placeholder="Enter value"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} className="text-purple-600" />
                Actions
              </CardTitle>
              <CardDescription>What should happen when this automation is triggered?</CardDescription>
            </div>
            <Button onClick={addAction} size="sm">
              <Plus size={16} className="mr-1" />
              Add Action
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {automationData.actions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Settings size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No actions configured. Add actions to define what happens in this automation.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {automationData.actions.map((action, index) => (
                <div key={index}>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(action.type)}
                        <span className="font-medium">Action {index + 1}</span>
                        <Badge variant="outline">{ACTION_TYPES.find(t => t.value === action.type)?.label}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAction(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Action Type</Label>
                        <Select
                          value={action.type}
                          onValueChange={(value) => updateAction(index, { type: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTION_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  {getActionIcon(type.value)}
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {action.type === 'wait' && (
                        <div>
                          <Label>Delay (hours)</Label>
                          <Input
                            type="number"
                            value={action.delay_hours || 0}
                            onChange={(e) => updateAction(index, { delay_hours: parseInt(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                      )}

                      {action.type === 'send_email' && (
                        <>
                          <div>
                            <Label>Email Template</Label>
                            <Select
                              value={action.template_id || ''}
                              onValueChange={(value) => updateAction(index, { template_id: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select template" />
                              </SelectTrigger>
                              <SelectContent>
                                {templates.map(template => (
                                  <SelectItem key={template.id} value={template.id}>
                                    {template.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {action.delay_hours !== undefined && (
                            <div>
                              <Label>Send Delay (hours)</Label>
                              <Input
                                type="number"
                                value={action.delay_hours}
                                onChange={(e) => updateAction(index, { delay_hours: parseInt(e.target.value) })}
                                placeholder="0"
                              />
                            </div>
                          )}
                        </>
                      )}

                      {action.type === 'add_tag' && (
                        <div>
                          <Label>Tag Name</Label>
                          <Input
                            value={action.config.tag_name || ''}
                            onChange={(e) => updateAction(index, {
                              config: { ...action.config, tag_name: e.target.value }
                            })}
                            placeholder="Enter tag name"
                          />
                        </div>
                      )}

                      {action.type === 'update_segment' && (
                        <div>
                          <Label>Segment Action</Label>
                          <Select
                            value={action.config.segment_action || 'add'}
                            onValueChange={(value) => updateAction(index, {
                              config: { ...action.config, segment_action: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="add">Add to Segment</SelectItem>
                              <SelectItem value="remove">Remove from Segment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {index < automationData.actions.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowDown size={20} className="text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save/Cancel */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {automation ? 'Update Automation' : 'Create Automation'}
        </Button>
      </div>
    </div>
  );
};

export default AutomationBuilder;