
import React from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactInformationProps {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  onContactClick: () => void;
  compact?: boolean;
}

const ContactInformation: React.FC<ContactInformationProps> = ({
  contactName,
  contactEmail,
  contactPhone,
  onContactClick,
  compact = false
}) => {
  // Compact mode for sidebar
  if (compact) {
    return (
      <div className="space-y-3">
        <h3 className="text-base font-medium">Contact Owner</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="truncate">{contactName}</span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="truncate">{contactPhone}</span>
          </div>
        </div>
        <Button 
          className="w-full mt-2" 
          onClick={onContactClick}
          size="sm"
        >
          Email Owner
        </Button>
      </div>
    );
  }

  // Full contact information display
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center">
          <User className="h-5 w-5 mr-3 text-primary" />
          <div>
            <p className="font-medium">Name</p>
            <p>{contactName}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Mail className="h-5 w-5 mr-3 text-primary" />
          <div>
            <p className="font-medium">Email</p>
            <p>{contactEmail}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Phone className="h-5 w-5 mr-3 text-primary" />
          <div>
            <p className="font-medium">Phone</p>
            <p>{contactPhone}</p>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full mt-6" 
        onClick={onContactClick}
      >
        Contact Owner
      </Button>
    </div>
  );
};

export default ContactInformation;
