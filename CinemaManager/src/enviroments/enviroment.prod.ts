export const environment = {
    production: true,
    apiBaseUrl: 'https://????.com/api',
    apiEndpoints: {
      // User endpoints
      login: '/User/Login',
      register: 'User/SignUp',
      getUser: '/User/GetUserById/{userId}',
      updateUser: '/User/UpdateUser',
      changePassword: '/User/ChangePassword',
      
      // Movie endpoints
      getAllMovies: '/Movie/GetAll',
      getShowingMovies: '/Movie/GetShowingMovies',
      getCommingUpMovies : '/Movie/GetUpComingMovies',
      getMovieById: '/Movie/GetMovieById/{movieId}',
      addMovie: '/Movie/Add',
      updateMovie: '/Movie/Update',
      deleteMovie: '/Movie/Delete',
      
      // Cinema endpoints
      getAllCinemas: '/Cinema/GetAllCinemas',
      getCinemaById: '/Cinema/GetById',
      addCinema: '/Cinema/Add',
      
      // Showtime endpoints
      getAllShowtimes: '/Showtime/GetAll',
      getShowtimeById: '/Showtime/GetById',
      getShowtimesByMovie: '/Showtime/GetByMovie',
      addShowtime: '/Showtime/Add',
      updateShowtime: '/Showtime/Update',
      deleteShowtime: '/Showtime/Delete',
      
      // Booking endpoints
      addBooking: '/Booking/Add',
      getBookingsByUser: '/Booking/User/{userId}',
      cancelBooking: '/Booking/Cancel/{userId}/{bookingId}',
      bookTickets: '/Booking/BookTickets',
      
      // Seat endpoints
      getAvailableSeats: '/Seat/GetAvailableSeats/{movieId}/{cinema}/{date}/{startTime}/{endTime}',
      // SignalR endpoints
      signalRBaseUrl: 'https://localhost:7057/adminHub'
    }
  };