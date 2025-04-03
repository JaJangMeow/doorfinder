
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Home } from "lucide-react";

interface PropertyBasicInfoProps {
  methods: any;
}

const PropertyBasicInfo: React.FC<PropertyBasicInfoProps> = ({ methods }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center">
        <Home className="mr-2 text-primary" size={20} />
        Property Details
      </h2>
      
      <FormField
        control={methods.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Listing Title</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., Cozy 2BR Apartment near KJC"
                {...field}
                className="mt-1"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={methods.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., 123 College St, Bangalore"
                {...field}
                className="mt-1"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={methods.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Rent (₹)</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="e.g., 15000"
                  {...field}
                  className="mt-1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={methods.control}
          name="deposit_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Security Deposit (₹)</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="e.g., 30000"
                  {...field}
                  className="mt-1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default PropertyBasicInfo;
