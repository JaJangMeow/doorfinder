
import React from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Building, User2 } from "lucide-react";

interface PropertyTypeSelectionProps {
  methods: any;
}

const PropertyTypeSelection: React.FC<PropertyTypeSelectionProps> = ({ methods }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={methods.control}
        name="property_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Type</FormLabel>
            <div className="flex gap-4 mt-2">
              <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer w-full ${field.value === 'rental' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-foreground'}`}>
                <input
                  type="radio"
                  value="rental"
                  checked={field.value === 'rental'}
                  onChange={() => field.onChange('rental')}
                  className="sr-only"
                />
                <Building className="mr-2" size={18} />
                Rental
              </label>
              
              <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer w-full ${field.value === 'pg' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-foreground'}`}>
                <input
                  type="radio"
                  value="pg"
                  checked={field.value === 'pg'}
                  onChange={() => field.onChange('pg')}
                  className="sr-only"
                />
                <User2 className="mr-2" size={18} />
                PG Accommodation
              </label>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={methods.control}
        name="gender_preference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gender Preference</FormLabel>
            <div className="flex gap-4 mt-2">
              <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer flex-1 ${field.value === 'boys' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-foreground'}`}>
                <input
                  type="radio"
                  value="boys"
                  checked={field.value === 'boys'}
                  onChange={() => field.onChange('boys')}
                  className="sr-only"
                />
                Boys Only
              </label>
              
              <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer flex-1 ${field.value === 'girls' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-foreground'}`}>
                <input
                  type="radio"
                  value="girls"
                  checked={field.value === 'girls'}
                  onChange={() => field.onChange('girls')}
                  className="sr-only"
                />
                Girls Only
              </label>
              
              <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer flex-1 ${field.value === 'any' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-foreground'}`}>
                <input
                  type="radio"
                  value="any"
                  checked={field.value === 'any'}
                  onChange={() => field.onChange('any')}
                  className="sr-only"
                />
                No Preference
              </label>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PropertyTypeSelection;
