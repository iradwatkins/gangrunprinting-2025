import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';

export async function createDemoPaperStocks() {
  const demoPaperStocks: Array<{
    paper: TablesInsert<'paper_stocks'>;
    coatings: string[];
    defaultCoating: string;
  }> = [
    {
      paper: {
        name: '14pt Card Stock',
        weight: 350,
        price_per_sq_inch: 0.008,
        second_side_markup_percent: 80,
        single_sided_available: true,
        double_sided_available: true,
        sides_tooltip_text: 'Choose single-sided for front only, or double-sided for front and back printing. Double-sided adds 80% to base price.',
        coatings_tooltip_text: 'This premium card stock works excellently with all coating options for professional results.',
        description: 'Premium thick card stock perfect for business cards and high-end marketing materials',
        is_active: true
      },
      coatings: ['No Coating', 'High Gloss UV', 'Matte Finish'],
      defaultCoating: 'No Coating'
    },
    {
      paper: {
        name: '100lb Text Paper',
        weight: 148,
        price_per_sq_inch: 0.005,
        second_side_markup_percent: 0,
        single_sided_available: true,
        double_sided_available: true,
        sides_tooltip_text: 'Text paper supports both single and double-sided printing at the same price.',
        coatings_tooltip_text: 'Light text paper works best with no coating or light finishes.',
        description: 'High-quality text weight paper for flyers, brochures, and newsletters',
        is_active: true
      },
      coatings: ['No Coating', 'Matte Finish'],
      defaultCoating: 'No Coating'
    },
    {
      paper: {
        name: 'Premium Cardboard',
        weight: 500,
        price_per_sq_inch: 0.012,
        second_side_markup_percent: 150,
        single_sided_available: true,
        double_sided_available: true,
        sides_tooltip_text: 'Heavy cardboard requires special handling for double-sided printing, adding 150% to base price.',
        coatings_tooltip_text: 'Thick cardboard supports all coating types and provides excellent protection.',
        description: 'Extra thick cardboard for premium packaging and presentation folders',
        is_active: true
      },
      coatings: ['No Coating', 'High Gloss UV', 'Matte Finish', 'Satin Finish'],
      defaultCoating: 'High Gloss UV'
    }
  ];

  const results = [];

  for (const demo of demoPaperStocks) {
    try {
      // Check if paper stock already exists
      const { data: existing } = await supabase
        .from('paper_stocks')
        .select('id')
        .eq('name', demo.paper.name)
        .single();

      if (!existing) {
        // Create paper stock
        const { data: paperStock, error: paperError } = await supabase
          .from('paper_stocks')
          .insert(demo.paper)
          .select()
          .single();

        if (paperError) {
          console.error(`Failed to create ${demo.paper.name}:`, paperError);
          results.push({ name: demo.paper.name, success: false, error: paperError.message });
          continue;
        }

        // Get coating IDs
        const { data: coatings } = await supabase
          .from('coatings')
          .select('id, name')
          .in('name', demo.coatings);

        if (coatings && paperStock) {
          // Link coatings to paper stock
          for (const coating of coatings) {
            const isDefault = coating.name === demo.defaultCoating;
            const { error: linkError } = await supabase
              .from('paper_stock_coatings')
              .insert({
                paper_stock_id: paperStock.id,
                coating_id: coating.id,
                is_default: isDefault
              });

            if (linkError) {
              console.warn(`Failed to link coating ${coating.name} to ${demo.paper.name}:`, linkError);
            }
          }
        }

        console.log(`Created complete paper stock: ${demo.paper.name}`);
        results.push({ 
          name: demo.paper.name, 
          success: true, 
          data: paperStock,
          coatings: demo.coatings.length
        });
      } else {
        console.log(`Paper stock already exists: ${demo.paper.name}`);
        results.push({ name: demo.paper.name, success: true, existing: true });
      }
    } catch (error) {
      console.error(`Error creating ${demo.paper.name}:`, error);
      results.push({ 
        name: demo.paper.name, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  return results;
}