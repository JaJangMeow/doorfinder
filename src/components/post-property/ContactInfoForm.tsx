
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

interface ContactInfoFormProps {
  methods: any;
  formValues: any;
  media: any[];
}

const ContactInfoForm: React.FC<ContactInfoFormProps> = ({ methods, formValues, media }) => {
  return (
    <div className="glass rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-semibold flex items-center">
        <User className="mr-2 text-primary" size={20} />
        Contact Information
      </h2>
      
      <div className="space-y-4">
        <FormField
          control={methods.control}
          name="contact_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., John Doe"
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
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="e.g., john@example.com"
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
          name="contact_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., +91 9876543210"
                  {...field}
                  className="mt-1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <ListingPreview formValues={formValues} media={media} />
      </div>
    </div>
  );
};

export default ContactInfoForm;

const ListingPreview: React.FC<{ formValues: any; media: any[] }> = ({ formValues, media }) => {
  return (
    <div className="p-4 bg-muted/50 rounded-lg mt-4">
      <h3 className="font-medium mb-2">Review Your Listing</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div className="flex items-start">
          <span className="font-medium mr-2">Title:</span>
          <span className="text-muted-foreground">{formValues.title}</span>
        </div>
        <div className="flex items-start">
          <span className="font-medium mr-2">Price:</span>
          <span className="text-muted-foreground">₹{formValues.price}/month</span>
        </div>
        <div className="flex items-start">
          <span className="font-medium mr-2">Deposit:</span>
          <span className="text-muted-foreground">{formValues.deposit_amount ? `₹${formValues.deposit_amount}` : 'Not specified'}</span>
        </div>
        <div className="flex items-start">
          <span className="font-medium mr-2">Type:</span>
          <span className="text-muted-foreground">{formValues.property_type === 'pg' ? 'PG Accommodation' : 'Rental'}</span>
        </div>
        <div className="flex items-start">
          <span className="font-medium mr-2">For:</span>
          <span className="text-muted-foreground">
            {formValues.gender_preference === 'boys' ? 'Boys Only' : 
             formValues.gender_preference === 'girls' ? 'Girls Only' : 'Anyone (No Preference)'}
          </span>
        </div>
        <div className="flex items-start">
          <span className="font-medium mr-2">Floor:</span>
          <span className="text-muted-foreground">
            {formValues.floor_number === '0' ? 'Ground Floor' : `${formValues.floor_number}${
              formValues.floor_number === '1' ? 'st' : 
              formValues.floor_number === '2' ? 'nd' : 
              formValues.floor_number === '3' ? 'rd' : 'th'} Floor`}
          </span>
        </div>
        <div className="flex items-start">
          <span className="font-medium mr-2">Rooms:</span>
          <span className="text-muted-foreground">{formValues.bedrooms} BR, {formValues.bathrooms} Bath</span>
        </div>
        <div className="flex items-start">
          <span className="font-medium mr-2">Area:</span>
          <span className="text-muted-foreground">{formValues.square_feet} sq ft</span>
        </div>
        <div className="flex items-start">
          <span className="font-medium mr-2">Address:</span>
          <span className="text-muted-foreground">{formValues.address}</span>
        </div>
        <div className="flex items-start">
          <span className="font-medium mr-2">Available:</span>
          <span className="text-muted-foreground">{new Date(formValues.available_from).toLocaleDateString()}</span>
        </div>
        <div className="flex items-start">
          <span className="font-medium mr-2">Near:</span>
          <span className="text-muted-foreground">{formValues.nearby_college}</span>
        </div>
        <div className="flex items-start">
          <span className="font-medium mr-2">Features:</span>
          <span className="text-muted-foreground">
            {formValues.has_hall ? 'Hall, ' : ''}
            {formValues.has_separate_kitchen ? 'Separate Kitchen' : ''}
            {!formValues.has_hall && !formValues.has_separate_kitchen ? 'Standard' : ''}
          </span>
        </div>
      </div>
      {formValues.restrictions && (
        <div className="mt-3">
          <span className="text-sm font-medium">Restrictions:</span>
          <p className="text-sm text-muted-foreground mt-1">{formValues.restrictions}</p>
        </div>
      )}
      {media.length > 0 && (
        <div className="mt-4">
          <span className="text-sm font-medium">Media:</span>
          <div className="flex mt-2 space-x-2 overflow-x-auto pb-2">
            {media.map((item, idx) => (
              <div key={idx} className="relative h-16 w-16 overflow-hidden rounded-md">
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt={`Property preview ${idx+1}`} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-black">
                    <span className="text-xs text-white">Video</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
