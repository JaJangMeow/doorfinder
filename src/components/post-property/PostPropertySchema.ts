
import { z } from "zod";

// Define the form schema with Zod
export const propertyFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  address: z.string().min(1, "Address is required"),
  price: z.string().min(1, "Price is required"),
  bedrooms: z.string(),
  bathrooms: z.string(),
  square_feet: z.string(),
  description: z.string().optional(),
  available_from: z.string(),
  nearby_college: z.string().min(1, "Nearby college is required"),
  contact_name: z.string().min(1, "Contact name is required"),
  contact_email: z.string().email("Invalid email format"),
  contact_phone: z.string().min(1, "Phone number is required"),
  has_hall: z.boolean().default(false),
  has_separate_kitchen: z.boolean().default(false),
  floor_number: z.string(),
  property_type: z.enum(["rental", "pg"]),
  gender_preference: z.enum(["boys", "girls", "any"]),
  restrictions: z.string().optional(),
  deposit_amount: z.string().optional(),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export const defaultValues: PropertyFormValues = {
  title: "",
  address: "",
  price: "",
  bedrooms: "2",
  bathrooms: "1",
  square_feet: "800",
  description: "",
  available_from: new Date().toISOString().split('T')[0],
  nearby_college: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  has_hall: false,
  has_separate_kitchen: false,
  floor_number: "0",
  property_type: "rental",
  gender_preference: "any",
  restrictions: "",
  deposit_amount: "",
};

export const popularColleges = [
  "Bangalore University",
  "Indian Institute of Science (IISc)",
  "Christ University",
  "Kristu Jayanti College",
  "Mount Carmel College",
  "St. Joseph's College",
  "Ramaiah Institute of Technology",
  "PES University",
  "Jain University",
  "BMS College of Engineering",
  "RV College of Engineering",
  "MS Ramaiah Medical College",
];
