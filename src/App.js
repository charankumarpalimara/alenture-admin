import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, Box, useMediaQuery } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import Poppins font weights
import "@fontsource/poppins/300.css"; // Light
import "@fontsource/poppins/400.css"; // Regular
import "@fontsource/poppins/500.css"; // Medium
import "@fontsource/poppins/600.css"; // Semi-bold
import "@fontsource/poppins/700.css"; // Bold

// Import your components
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Cm from "./scenes/cm";
import Hob from "./scenes/hob";
import Crm from "./scenes/crm";
import Organization from "./scenes/organization";
// import Bar from "./scenes/bar";
import Line from "./scenes/line";
// import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
// import Geography from "./scenes/geography";
import Calendar from "./scenes/calendar/calendar";
import Profile from "./scenes/profile";
import Notes from "./scenes/notes";
import CmDetails from "./scenes/cmdetails";
import CrmDetails from "./scenes/crmdetails";
import OrganizationDetails from "./scenes/organizationdetails";
import Organizationadd from "./scenes/organizationdetails/organizationadd";
import HobDetails from "./scenes/hobdetails";
import TicketDetails from "./scenes/ticketsdetails";
import HobForm from "./scenes/form";
import CmForm from "./scenes/cmform";
import CrmForm from "./scenes/crmform";
import BsuForm from "./scenes/bsuform";
import OrganizationForm from "./scenes/organizationform";
import Login from "./scenes/login";
// import Tasks from "./scenes/tasks";
// import TaskForm from "./scenes/taskform";
// import TaskDetails from "./scenes/taskdetails";
import AllExperiences from "./scenes/experiences/allExperiences";
import NewExperiences from "./scenes/experiences/newExperiences";
import PendingExperiences from "./scenes/experiences/pendingExperiences";
import ResolvedExperiences from "./scenes/experiences/resolvedExperiences";
import TaskDetails from "./scenes/taskdetails";

// const SOCKET_URL =
//   process.env.REACT_APP_SOCKET_URL ||
//   (window.location.hostname === "localhost"
//     ? "http://localhost:8080"
//     : "http://161.35.54.196:8080");
// console.log("API URL:", process.env.REACT_APP_API_URL);

// const WS_URL =
//   process.env.REACT_APP_WS_URL ||
//   (window.location.hostname === "localhost"
//     ? "ws://localhost:8080"
//     : "ws://161.35.54.196:8080");

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const isMobile = useMediaQuery("(max-width: 900px)");
  const queryClient = new QueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem("userDetails")
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
  };
  const handlelogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("token"); // Remove the authentication token
    sessionStorage.removeItem("userDetails"); // Remove user data
  };

  // Create theme with Poppins font
  const appTheme = createTheme(theme, {
    typography: {
      fontFamily: [
        "Poppins",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(","),
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 500 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: "Poppins, sans-serif",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
          },
        },
      },
      MuiTypography: {
        defaultProps: {
          fontFamily: "Poppins, sans-serif",
        },
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={appTheme}>
          <CssBaseline />

          {/* Conditionally render Topbar and Sidebar based on authentication */}
          {isAuthenticated && (
            <>
              <Box sx={{ width: "100vw", top: 5, zIndex: 1000 }}>
                <Topbar setIsSidebar={setIsSidebar} onLogout={handlelogout} />
              </Box>

              {!isMobile && isSidebar && (
                <Box
                  sx={{
                    position: "fixed",
                    left: 0,
                    top: "64px",
                    height: "calc(100vh - 64px)",
                    width: "260px",
                    zIndex: 900,
                  }}
                >
                  <Sidebar isSidebar={isSidebar} onLogout={handlelogout} />
                </Box>
              )}
            </>
          )}

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              marginLeft: isMobile
                ? "0px"
                : isSidebar && isAuthenticated
                ? "260px"
                : "0px",
              marginTop: isAuthenticated ? "0px" : "60px",
              padding: "20px 20px 20px",
              overflowY: "auto",
              transition: "margin 0.3s ease-in-out",
              "&::-webkit-scrollbar": {
                width: "1px",
                height: "5px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#000000",
                borderRadius: "4px",
              },
              fontFamily: "Poppins, sans-serif !important",
            }}
          >
            {/* Conditionally render Routes */}
            <Routes>
              {!isAuthenticated ? (
                <Route path="*" element={<Login onLogin={handleLogin} />} />
              ) : (
                <>
                  <Route path="/admin" element={<Dashboard />} />
                  <Route
                    path="/admin/allExperiences"
                    element={<AllExperiences />}
                  />
                  <Route
                    path="/admin/newExperiences"
                    element={<NewExperiences />}
                  />
                  <Route
                    path="/admin/pendingExperiences"
                    element={<PendingExperiences />}
                  />
                  <Route
                    path="/admin/resolvedExperiences"
                    element={<ResolvedExperiences />}
                  />
                  <Route path="/admin/cm" element={<Cm />} />
                  <Route path="/admin/crm" element={<Crm />} />
                  <Route path="/admin/hob" element={<Hob />} />

                  <Route
                    path="/admin/organization"
                    element={<Organization />}
                  />
                  <Route path="/admin/profile" element={<Profile />} />
                  <Route path="/admin/notes" element={<Notes />} />
                  <Route path="/admin/form" element={<HobForm />} />
                  <Route path="/admin/cmform" element={<CmForm />} />
                  <Route path="/admin/crmform" element={<CrmForm />} />
                  <Route path="/admin/bsuform" element={<BsuForm />} />
                  <Route
                    path="/admin/organizationform"
                    element={<OrganizationForm />}
                  />
                  <Route path="/admin/cmdetails" element={<CmDetails />} />
                  <Route path="/admin/crmdetails" element={<CrmDetails />} />
                  <Route
                    path="/admin/organizationdetails"
                    element={<OrganizationDetails />}
                  />
                  <Route
                    path="/admin/organizationadd"
                    element={<Organizationadd />}
                  />
                  <Route path="/admin/hobdetails" element={<HobDetails />} />
                  <Route
                    path="/admin/ticketdetails"
                    element={<TicketDetails />}
                  />
                  <Route path="/admin/taskdetails" element={<TaskDetails />} />
                  {/* <Route path="/bar" element={<Bar />} /> */}
                  {/* <Route path="/pie" element={<Pie />} /> */}
                  <Route path="/admin/line" element={<Line />} />
                  <Route path="/admin/faq" element={<FAQ />} />
                  <Route path="/admin/calendar" element={<Calendar />} />
                  {/* <Route path="/geography" element={<Geography />} /> */}
                  <Route path="*" element={<Navigate to="/admin" />} />
                </>
              )}
            </Routes>
          </Box>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
