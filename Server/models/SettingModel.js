const mongoose = require("mongoose");

// System-wide configuration settings for the application.
// Only a single document is expected (but not enforced) so the admin panel
// can fetch & update without worrying about creating duplicates.
const settingSchema = new mongoose.Schema(
  {
    siteTitle: {
      type: String,
      default: "Communiatec",
    },
    maintenanceMode: {
      type: Boolean,
      default: false, // when true, non-admin users will see maintenance page
    },
    allowRegistration: {
      type: Boolean,
      default: true,
    },
    defaultUserRole: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Setting", settingSchema);
