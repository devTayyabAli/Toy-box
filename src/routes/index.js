const userRoutes = require("../modules/user/user.routes");
const ridesRoutes = require("../modules/rides/rides.routes");
const requestsRoutes = require("../modules/requests/requests.routes");
const conciergeRoutes = require("../modules/concierge/concierge.routes");
const authRoutes = require("./auth.route");
const clinicRoutes = require("../modules/clinic/clinic.routes");
const ptRoutes = require("../modules/pt/pt.routes");
const notificationsRoutes = require("../modules/notifications/notifications.routes");
const roleRequestsRoutes = require("../modules/roleRequests/roleRequests.routes");
const supportRoutes = require("../modules/support/support.routes");
const eventsRoutes = require("../modules/events/events.routes");
const garageAliasRoutes = require("../modules/garage/garage.alias.routes");
const detailingRoutes = require("../modules/detailing/detailing.routes");
const maintenanceRoutes = require("../modules/maintenance/maintenance.routes");
const sourcingRoutes = require("../modules/sourcing/sourcing.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");
const bookingsHubRoutes = require("../modules/bookingsHub/bookingsHub.routes");
const transportRoutes = require("../modules/transport/transport.routes");
const messagesRoutes = require("../modules/messages/messages.routes");
const paymentMethodsRoutes = require("../modules/paymentMethods/paymentMethods.routes");
const stripeRoutes = require("../modules/stripe/stripe.routes");
const chatRoutes = require("../modules/chat/chat.routes");
const adminRoutes = require("../modules/admin/admin.routes");
const staffRoutes = require("../modules/staff/staff.routes");
const { healthCheck } = require("./health");
const { versionInfo } = require("./version");
const { VERSIONED_PREFIX } = require("../config/apiVersion");

const API_MOUNTS = [
  ["/members", userRoutes],
  ["/vehicles", ridesRoutes],
  ["/garage", garageAliasRoutes],
  ["/detailing", detailingRoutes],
  ["/maintenance", maintenanceRoutes],
  ["/sourcing", sourcingRoutes],
  ["/dashboard", dashboardRoutes],
  ["/bookings", bookingsHubRoutes],
  ["/transport", transportRoutes],
  ["/messages", messagesRoutes],
  ["/chat", chatRoutes],
  ["/payment-methods", paymentMethodsRoutes],
  ["/stripe", stripeRoutes],
  ["/requests", requestsRoutes],
  ["/concierge", conciergeRoutes],
  ["/auth", authRoutes],
  ["/clinics", clinicRoutes],
  ["/pt", ptRoutes],
  ["/notifications", notificationsRoutes],
  ["/role-requests", roleRequestsRoutes],
  ["/support", supportRoutes],
  ["/events", eventsRoutes],
  ["/admin", adminRoutes],
  ["/staff", staffRoutes],
];

function registerRoutes(app) {
  app.get(`${VERSIONED_PREFIX}/health`, healthCheck);
  app.get(`${VERSIONED_PREFIX}/version`, versionInfo);

  for (const [segment, router] of API_MOUNTS) {
    app.use(`${VERSIONED_PREFIX}${segment}`, router);
  }
}

module.exports = registerRoutes;
