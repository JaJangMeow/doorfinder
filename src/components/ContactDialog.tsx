
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactDialog: React.FC<ContactDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Us</DialogTitle>
          <DialogDescription>
            Reach out to the team behind DoorFinder
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 text-sm">
          <p className="mb-4">
            Siamtu- Joela, Ngaihtuah chhuak tu- Zoela, Din tu- Loela, Develop tu- Koela, Siam ve lo tu- PibaTRAIN-a. 
          </p>
          <p>
            joel; IG- mew_chew_
          </p>
        </div>
        <DialogClose asChild>
          <Button variant="ghost" className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
