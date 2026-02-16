export type AuthRoutes = {
  '/login': undefined;
  '/register': undefined;
  '/onboarding': undefined;
};

export type TabRoutes = {
  '/': undefined;
  '/contacts': undefined;
  '/profile': undefined;
};

export type TripRoutes = {
  '/trip/create': undefined;
  '/trip/active': { tripId: string };
  '/trip/notes': { tripId: string };
  '/trip/complete': { tripId: string };
};

export type AppRoutes = AuthRoutes & TabRoutes & TripRoutes;
