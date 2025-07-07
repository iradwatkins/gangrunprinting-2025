/**
 * Add-on Dependencies Logic
 * Handles conditional add-on requirements as specified in documentation
 * 
 * Key dependencies from documentation:
 * - EDDM Process & Postage → Mandatory "Paper Banding" auto-selected & costed
 * - Folding → Minimum print size 5"x6"
 * - Design services → Various sub-options affect pricing
 * - "Our Tagline" → Hidden for brokers with assigned discount
 */

export interface AddOnDependency {
  trigger_addon_id: string;
  required_addon_id: string;
  is_mandatory: boolean;
  auto_select: boolean;
  condition?: (configuration: any) => boolean;
  error_message?: string;
}

export interface AddOnConflict {
  addon_id: string;
  conflicts_with: string[];
  error_message: string;
}

export interface AddOnVisibilityRule {
  addon_id: string;
  hidden_when: (configuration: any, user_profile: any) => boolean;
  reason: string;
}

export class AddOnDependencyManager {
  private dependencies: AddOnDependency[] = [
    // EDDM Process requires mandatory banding
    {
      trigger_addon_id: 'eddm_process',
      required_addon_id: 'banding',
      is_mandatory: true,
      auto_select: true,
      error_message: 'EDDM Process requires Paper Banding service'
    },
    
    // Score Only and Folding conflict (folding includes basic score for card stock)
    // This is handled via conflicts rather than dependencies
  ];

  private conflicts: AddOnConflict[] = [
    {
      addon_id: 'score_only',
      conflicts_with: ['folding'],
      error_message: 'Score Only service conflicts with Folding (card stock folding includes basic scoring)'
    }
  ];

  private visibilityRules: AddOnVisibilityRule[] = [
    // "Our Tagline" hidden for brokers with assigned discount
    {
      addon_id: 'our_tagline',
      hidden_when: (config: any, profile: any) => {
        return profile?.is_broker && 
               profile?.broker_category_discounts && 
               Object.keys(profile.broker_category_discounts).length > 0;
      },
      reason: 'Our Tagline discount is not available for brokers with assigned category discounts'
    },
    
    // EDDM services only for EDDM-eligible products
    {
      addon_id: 'eddm_process',
      hidden_when: (config: any, profile: any) => {
        return !config.product?.is_eddm_eligible;
      },
      reason: 'EDDM services are only available for EDDM-eligible products'
    },
    
    {
      addon_id: 'postal_delivery',
      hidden_when: (config: any, profile: any) => {
        return !config.product?.is_eddm_eligible;
      },
      reason: 'Postal Delivery (DDU) is only available for EDDM-eligible products'
    }
  ];

  /**
   * Check if an add-on should be visible based on current configuration and user profile
   */
  isAddOnVisible(addon_id: string, configuration: any, user_profile: any): boolean {
    const rule = this.visibilityRules.find(rule => rule.addon_id === addon_id);
    if (!rule) return true;
    
    return !rule.hidden_when(configuration, user_profile);
  }

  /**
   * Get the reason why an add-on is hidden
   */
  getHiddenReason(addon_id: string): string | null {
    const rule = this.visibilityRules.find(rule => rule.addon_id === addon_id);
    return rule?.reason || null;
  }

  /**
   * Process add-on selection and auto-select required dependencies
   */
  processAddOnSelection(
    selected_addon_id: string, 
    is_selected: boolean, 
    current_configuration: any
  ): {
    auto_selections: { addon_id: string; selected: boolean; reason: string }[];
    conflicts: string[];
    errors: string[];
  } {
    const result = {
      auto_selections: [] as { addon_id: string; selected: boolean; reason: string }[],
      conflicts: [] as string[],
      errors: [] as string[]
    };

    if (is_selected) {
      // Check for required dependencies
      const dependencies = this.dependencies.filter(dep => dep.trigger_addon_id === selected_addon_id);
      
      for (const dependency of dependencies) {
        if (dependency.auto_select) {
          result.auto_selections.push({
            addon_id: dependency.required_addon_id,
            selected: true,
            reason: `Automatically selected because ${selected_addon_id} requires it`
          });
        }
      }

      // Check for conflicts
      const conflict = this.conflicts.find(c => c.addon_id === selected_addon_id);
      if (conflict) {
        const conflicting_addons = conflict.conflicts_with.filter(
          addon_id => current_configuration.add_ons[addon_id]?.selected
        );
        
        if (conflicting_addons.length > 0) {
          result.conflicts.push(conflict.error_message);
          result.errors.push(conflict.error_message);
        }
      }
    } else {
      // If deselecting, check if other add-ons depend on this one
      const dependents = this.dependencies.filter(dep => dep.required_addon_id === selected_addon_id);
      
      for (const dependent of dependents) {
        if (current_configuration.add_ons[dependent.trigger_addon_id]?.selected) {
          if (dependent.is_mandatory) {
            result.errors.push(`Cannot deselect ${selected_addon_id} because ${dependent.trigger_addon_id} requires it`);
          } else {
            result.auto_selections.push({
              addon_id: dependent.trigger_addon_id,
              selected: false,
              reason: `Automatically deselected because ${selected_addon_id} is no longer available`
            });
          }
        }
      }
    }

    return result;
  }

  /**
   * Validate current add-on configuration for dependencies and conflicts
   */
  validateConfiguration(configuration: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check dependencies
    for (const dependency of this.dependencies) {
      const trigger_selected = configuration.add_ons[dependency.trigger_addon_id]?.selected;
      const required_selected = configuration.add_ons[dependency.required_addon_id]?.selected;

      if (trigger_selected && !required_selected && dependency.is_mandatory) {
        errors.push(dependency.error_message || 
          `${dependency.trigger_addon_id} requires ${dependency.required_addon_id}`);
      }
    }

    // Check conflicts
    for (const conflict of this.conflicts) {
      const addon_selected = configuration.add_ons[conflict.addon_id]?.selected;
      const conflicting_selected = conflict.conflicts_with.some(
        addon_id => configuration.add_ons[addon_id]?.selected
      );

      if (addon_selected && conflicting_selected) {
        errors.push(conflict.error_message);
      }
    }

    // Check size requirements for folding
    const folding_selected = configuration.add_ons['folding']?.selected;
    if (folding_selected && configuration.print_size) {
      const width = configuration.custom_width || configuration.print_size.width;
      const height = configuration.custom_height || configuration.print_size.height;
      
      if (width < 5 || height < 6) {
        errors.push('Folding service requires minimum print size of 5" × 6"');
      }
    }

    // Check EDDM eligibility
    const eddm_selected = configuration.add_ons['eddm_process']?.selected || 
                         configuration.add_ons['postal_delivery']?.selected;
    if (eddm_selected && !configuration.product?.is_eddm_eligible) {
      errors.push('EDDM services are not available for this product');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get recommended add-ons based on current configuration
   */
  getRecommendations(configuration: any): Array<{
    addon_id: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const recommendations = [];

    // Recommend digital proof for custom design orders
    const design_selected = configuration.add_ons['design']?.selected;
    const design_type = configuration.add_ons['design']?.sub_options?.service_type;
    const proof_selected = configuration.add_ons['digital_proof']?.selected;

    if (design_selected && design_type !== 'upload_artwork' && !proof_selected) {
      recommendations.push({
        addon_id: 'digital_proof',
        reason: 'Recommended for custom design orders to ensure accuracy',
        priority: 'high' as const
      });
    }

    // Recommend exact size for custom dimensions
    const custom_size = configuration.custom_width || configuration.custom_height;
    const exact_size_selected = configuration.add_ons['exact_size']?.selected;

    if (custom_size && !exact_size_selected) {
      recommendations.push({
        addon_id: 'exact_size',
        reason: 'Recommended for custom dimensions to ensure precise cutting',
        priority: 'medium' as const
      });
    }

    // Recommend banding for large quantities
    const large_quantity = configuration.quantity >= 5000;
    const banding_selected = configuration.add_ons['banding']?.selected;

    if (large_quantity && !banding_selected) {
      recommendations.push({
        addon_id: 'banding',
        reason: 'Recommended for large quantities to facilitate distribution',
        priority: 'low' as const
      });
    }

    return recommendations;
  }

  /**
   * Calculate additional turnaround days from selected add-ons
   */
  calculateAdditionalTurnaroundDays(configuration: any, addOnData: any[]): number {
    let additional_days = 0;

    for (const [addon_id, addon_config] of Object.entries(configuration.add_ons)) {
      if ((addon_config as any)?.selected) {
        const addon_data = addOnData.find(addon => addon.id === addon_id);
        if (addon_data?.additional_turnaround_days) {
          additional_days = Math.max(additional_days, addon_data.additional_turnaround_days);
        }
      }
    }

    return additional_days;
  }
}

export const addOnDependencyManager = new AddOnDependencyManager();