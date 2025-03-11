
import React from 'react';
import { User, Mail, Phone, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface ContactInformationProps {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  onContactClick: () => void;
}

const ContactInformation: React.FC<ContactInformationProps> = ({
  contactName,
  contactEmail,
  contactPhone,
  onContactClick
}) => {
  const { toast } = useToast();

  const handleCopyPhoneNumber = () => {
    navigator.clipboard.writeText(contactPhone);
    toast({
      title: "Phone number copied",
      description: "Phone number has been copied to clipboard.",
    });
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
      <div className="mt-2 space-y-2">
        <div className="flex items-center text-gray-700">
          <User className="mr-2 h-5 w-5" />
          {contactName}
        </div>
        <div className="flex items-center text-gray-700">
          <Mail className="mr-2 h-5 w-5" />
          {contactEmail}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-700">
            <Phone className="mr-2 h-5 w-5" />
            {contactPhone}
          </div>
          <Button 
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={handleCopyPhoneNumber}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Number
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <Button onClick={onContactClick}>
          Contact Owner
        </Button>
      </div>
    </div>
  );
};

export default ContactInformation;
