
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PropertyAdditionalInfoProps {
  methods: any;
  popularColleges: string[];
}

const PropertyAdditionalInfo: React.FC<PropertyAdditionalInfoProps> = ({ methods, popularColleges }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={methods.control}
        name="nearby_college"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nearby College/University</FormLabel>
            <Select 
              value={field.value} 
              onValueChange={(value) => {
                field.onChange(value);
              }}
            >
              <FormControl>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select college or type your own" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {popularColleges.map((college) => (
                  <SelectItem key={college} value={college}>
                    {college}
                  </SelectItem>
                ))}
                <SelectItem value="other">Other (specify in description)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={methods.control}
        name="available_from"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Available From</FormLabel>
            <FormControl>
              <Input 
                type="date"
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
        name="restrictions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Restrictions & Rules</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="e.g., Gate closing time at 10 PM, no overnight guests, etc."
                {...field}
                className="mt-1 min-h-[80px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={methods.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe your property. Include details about amenities, furnishings, distance to campus, and other relevant information for students."
                {...field}
                className="mt-1 min-h-[120px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PropertyAdditionalInfo;
