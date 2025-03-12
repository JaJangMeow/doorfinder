
import React from "react";
import { User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PropertyFormData } from "@/types/property";
import { MediaItem } from "@/types/property";

interface ContactInformationFormProps {
  formData: PropertyFormData;
  media: MediaItem[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const ContactInformationForm: React.FC<ContactInformationFormProps> = ({
  formData,
  media,
  handleChange,
}) => {
  return (
    <div className="glass rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-semibold flex items-center">
        <User className="mr-2 text-primary" size={20} />
        Contact Information
      </h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="contact_name">Your Name</Label>
          <Input 
            id="contact_name"
            name="contact_name"
            placeholder="e.g., John Doe"
            value={formData.contact_name}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="contact_email">Email</Label>
          <Input 
            id="contact_email"
            name="contact_email"
            type="email"
            placeholder="e.g., john@example.com"
            value={formData.contact_email}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="contact_phone">Phone Number</Label>
          <Input 
            id="contact_phone"
            name="contact_phone"
            placeholder="e.g., +91 9876543210"
            value={formData.contact_phone}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        
        <div className="p-4 bg-muted/50 rounded-lg mt-4">
          <h3 className="font-medium mb-2">Review Your Listing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex items-start">
              <span className="font-medium mr-2">Title:</span>
              <span className="text-muted-foreground">{formData.title}</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">Price:</span>
              <span className="text-muted-foreground">₹{formData.price}/month</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">Deposit:</span>
              <span className="text-muted-foreground">{formData.deposit_amount ? `₹${formData.deposit_amount}` : 'Not specified'}</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">Type:</span>
              <span className="text-muted-foreground">{formData.property_type === 'pg' ? 'PG Accommodation' : 'Rental'}</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">For:</span>
              <span className="text-muted-foreground">
                {formData.gender_preference === 'boys' ? 'Boys Only' : 
                 formData.gender_preference === 'girls' ? 'Girls Only' : 'Anyone (No Preference)'}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">Floor:</span>
              <span className="text-muted-foreground">
                {formData.floor_number === '0' ? 'Ground Floor' : `${formData.floor_number}${
                  formData.floor_number === '1' ? 'st' : 
                  formData.floor_number === '2' ? 'nd' : 
                  formData.floor_number === '3' ? 'rd' : 'th'} Floor`}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">Rooms:</span>
              <span className="text-muted-foreground">{formData.bedrooms} BR, {formData.bathrooms} Bath</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">Area:</span>
              <span className="text-muted-foreground">{formData.square_feet} sq ft</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">Address:</span>
              <span className="text-muted-foreground">{formData.address}</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">Available:</span>
              <span className="text-muted-foreground">{new Date(formData.available_from).toLocaleDateString()}</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">Near:</span>
              <span className="text-muted-foreground">{formData.nearby_college}</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">Features:</span>
              <span className="text-muted-foreground">
                {formData.has_hall ? 'Hall, ' : ''}
                {formData.has_separate_kitchen ? 'Separate Kitchen' : ''}
                {!formData.has_hall && !formData.has_separate_kitchen ? 'Standard' : ''}
              </span>
            </div>
          </div>
          {formData.restrictions && (
            <div className="mt-3">
              <span className="text-sm font-medium">Restrictions:</span>
              <p className="text-sm text-muted-foreground mt-1">{formData.restrictions}</p>
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
      </div>
    </div>
  );
};

export default ContactInformationForm;
