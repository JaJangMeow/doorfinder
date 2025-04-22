
import React from 'react';
import { User, Mail, Phone, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ContactInformationProps {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  onContactClick: () => void;
  compact?: boolean;
}

/**
 * Copy text to clipboard and show a toast.
 * Returns a function to call on button click.
 */
const useCopyToClipboard = () => {
  const { toast } = useToast();

  return (text: string, label = "Copied!") => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: label,
          description: "Phone number copied to clipboard!",
        });
      });
    } else {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        toast({
          title: label,
          description: "Phone number copied to clipboard!",
        });
      } catch (err) {
        toast({
          title: "Failed",
          description: "Could not copy the phone number",
          variant: "destructive",
        });
      }
      document.body.removeChild(textarea);
    }
  };
};

const ContactInformation: React.FC<ContactInformationProps> = ({
  contactName,
  contactEmail,
  contactPhone,
  compact = false
}) => {
  const copyToClipboard = useCopyToClipboard();

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
          size="sm"
          onClick={() => copyToClipboard(contactPhone, "Number copied!")}
        >
          <Copy className="h-4 w-4 mr-2" /> Copy Phone Number
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
        onClick={() => copyToClipboard(contactPhone, "Number copied!")}
      >
        <Copy className="h-4 w-4 mr-2" /> Copy Phone Number
      </Button>
    </div>
  );
};

export default ContactInformation;
