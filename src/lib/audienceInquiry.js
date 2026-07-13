// Shared institute-vs-corporate config for InstituteContactModal, used by
// AudienceNav, AudienceFooter, and the /institutions & /corporates pages.
// Keeps `table` / `orgField` / `programme` in sync with the DB CHECK
// constraints in supabase/migrations/corporate_inquiries.sql.
export const AUDIENCE_INQUIRY_CONFIG = {
  institutions: {
    path: "/institutions",
    table: "institute_inquiries",
    orgLabel: "institute name",
    orgField: "institute_name",
    programme: "institutions",
    whatsappUrl:
      "https://wa.me/919227123007?text=Hi%2C%20I%27m%20interested%20in%20evolve%20for%20institutions"
  },
  corporates: {
    path: "/corporates",
    table: "corporate_inquiries",
    orgLabel: "company name",
    orgField: "company_name",
    programme: "corporates",
    whatsappUrl:
      "https://wa.me/919227123007?text=Hi%2C%20I%27m%20interested%20in%20evolve%20for%20corporates"
  }
};
