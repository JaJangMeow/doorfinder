
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Building, User2 } from "lucide-react";

interface PropertyDetailsFormProps {
  methods: any;
  popularColleges: string[];
}

const PropertyDetailsForm: React.FC<PropertyDetailsFormProps> = ({ methods, popularColleges }) => {
  return (
    <div className="glass rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-semibold flex items-center">
        <Home className="mr-2 text-primary" size={20} />
        Property Details
      </h2>
      
      <div className="space-y-4">
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
        
        <PropertyFeatures methods={methods} />
        
        <FormField
          control={methods.control}
          name="nearby_college"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nearby College/University</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
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
    </div>
  );
};

export default PropertyDetailsForm;

const PropertyFeatures: React.FC<{ methods: any }> = ({ methods }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={methods.control}
          name="bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bedrooms</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 Bedroom</SelectItem>
                  <SelectItem value="2">2 Bedrooms</SelectItem>
                  <SelectItem value="3">3 Bedrooms</SelectItem>
                  <SelectItem value="4">4 Bedrooms</SelectItem>
                  <SelectItem value="5">5+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={methods.control}
          name="bathrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bathrooms</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 Bathroom</SelectItem>
                  <SelectItem value="2">2 Bathrooms</SelectItem>
                  <SelectItem value="3">3 Bathrooms</SelectItem>
                  <SelectItem value="4">4+ Bathrooms</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={methods.control}
          name="floor_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Floor Number</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">Ground Floor</SelectItem>
                  <SelectItem value="1">1st Floor</SelectItem>
                  <SelectItem value="2">2nd Floor</SelectItem>
                  <SelectItem value="3">3rd Floor</SelectItem>
                  <SelectItem value="4">4th Floor</SelectItem>
                  <SelectItem value="5">5th Floor</SelectItem>
                  <SelectItem value="6">6th Floor or higher</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={methods.control}
        name="square_feet"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Area (sq ft)</FormLabel>
            <Select 
              value={field.value} 
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="500">Under 500 sq ft</SelectItem>
                <SelectItem value="800">500-800 sq ft</SelectItem>
                <SelectItem value="1000">800-1000 sq ft</SelectItem>
                <SelectItem value="1500">1000-1500 sq ft</SelectItem>
                <SelectItem value="2000">1500+ sq ft</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="space-y-2">
        <Label>Additional Features</Label>
        <div className="flex flex-wrap gap-4 mt-1">
          <FormField
            control={methods.control}
            name="has_hall"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_hall"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="has_hall" className="cursor-pointer">Has Living Room/Hall</Label>
              </div>
            )}
          />
          
          <FormField
            control={methods.control}
            name="has_separate_kitchen"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_separate_kitchen"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="has_separate_kitchen" className="cursor-pointer">Separate Kitchen</Label>
              </div>
            )}
          />
        </div>
      </div>
    </>
  );
};
