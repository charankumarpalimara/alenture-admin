import {
  Box,
  IconButton,
  useTheme,
  Typography,
  useMediaQuery,
  Modal,
  Backdrop,
  ListItem,
  List,
  ListItemIcon,
  ListItemText,
  Drawer,
} from "@mui/material";
import { useState, useEffect } from "react";
import { tokens } from "../../theme";
import { Link, useLocation } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
// import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import logoLight from "./logo.png";
import { useNavigate } from "react-router-dom";
import Badge from "@mui/material/Badge";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminNotifications, markNotificationRead } from "../../utils/http";

// Shared getActivePage function
const getActivePage = (pathname) => {
  if (pathname.includes("/admin/crm") || pathname.includes("/admin/crmform")) {
    return "/admin/crm";
  } else if (
    pathname.includes("/admin/cm") ||
    pathname.includes("/admin/cmform")
  ) {
    return "/admin/cm";
  } else if (
    pathname.includes("/admin/hob") ||
    pathname.includes("/admin/form")
  ) {
    return "/admin/hob";
  } else if (pathname.includes("/admin/notes")) {
    return "/admin/notes";
  } else if (pathname.includes("/admin/calendar")) {
    return "/admin/calendar";
  } else if (
    pathname.includes("/admin/tasks") ||
    pathname.includes("/admin/taskform")
  ) {
    return "/admin/tasks";
  } else if (pathname.includes("/admin/organization")) {
    return "/admin/organization";
  } else if (
    pathname === "/admin" ||
    pathname === "/admin/" ||
    pathname.includes("/admin/ticketdetails") ||
    pathname.includes("/admin/allExperiences") ||
    pathname.includes("/admin/newExperiences") ||
    pathname.includes("/admin/profile") ||
    pathname.includes("/admin/taskdetails") ||
    pathname.includes("/admin/pendingExperiences") ||
    pathname.includes("/admin/resolvedExperiences")
  ) {
    return "/admin"; // Dashboard is active for these routes
  } else {
    return pathname;
  }
};

// Sidebar Item Component (Reused from Sidebar)
const Item = ({ title, to, icon, selected, setSelected, handleClose }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <ListItem
      button
      component={Link}
      to={to}
      selected={selected === to}
      onClick={() => {
        setSelected(to);
        sessionStorage.setItem("selectedSidebarItem", to);
        if (handleClose) handleClose();
      }}
      sx={{
        color: selected === to ? "white" : colors.blueAccent[500],
        fontWeight: selected === to ? "bold" : "regular",
        backgroundColor: selected === to ? colors.blueAccent[700] : "inherit",
        borderRadius: "10px",
        marginBottom: "8px",
        "&:hover": {
          backgroundColor: selected === to ? "#3e4396 !important" : "none", // Ensure no hover effect
          color: selected === to ? "white" : colors.blueAccent[500],
        },
      }}
    >
      <ListItemIcon sx={{ color: "inherit" }}>{icon}</ListItemIcon>
      <ListItemText
        primary={title}
        sx={{
          "& .MuiTypography-root": {
            // Target the nested Typography component
            fontWeight: "bold !important", // Ensure text is bold for selected item
            fontSize: "15px",
          },
        }}
      />
    </ListItem>
  );
};

const Topbar = ({ onLogout }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 900px)");
  const location = useLocation();
  const [selected, setSelected] = useState(getActivePage(location.pathname));
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  const userDetails = JSON.parse(sessionStorage.getItem("userDetails")) || {}; // Retrieve user details from sessionStorage

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: notificationList,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => getAdminNotifications(),
  });
  const { mutate: markNotificationReadMutate } = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (data) => {
      queryClient.invalidateQueries("admin-notifications");
      console.log("updated");
    },
    onError: (error) => {
      console.log("eror");
    },
  });
  const { mutate, isPending: loading } = useMutation({
    mutationFn: "getNotificationsDetails",
    onSuccess: (data) => {
      navigate("/ticketdetails", { state: { ticket: data.data } });

      queryClient.invalidateQueries("admin-notifications");
    },
    onError: (error) => {},
  });

  useEffect(() => {
    if (!isLoading && !isError && notificationList?.data?.length > 0) {
      const unreadNotifs = notificationList.data.filter(
        (notif) => notif.is_read === 0
      );
      const totalUnread = unreadNotifs.length;
      console.log("Total unread notifications:", totalUnread);
      setUnreadCount(totalUnread);
    }
  }, [isLoading, isError, notificationList]);

  useEffect(() => {
    // Replace with your actual WebSocket server URL
    const ws = new WebSocket(process.env.REACT_APP_WS_URL);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "notification") {
          // setNotifications((prev) => [data, ...prev]);
          // setUnreadCount((prev) => prev + 1);
          queryClient.invalidateQueries("admin-notifications");
          setSnackbarMsg(data.message);
          setSnackbarOpen(true);
        }
      } catch (e) {
        // Ignore non-JSON or unrelated messages
      }
    };

    return () => ws.close();
  }, []);

  const handleNotificationsClick = () => {
    setDrawerOpen(true);
    // Optionally open a modal/dropdown with notifications
  };
  const notifClick = (data) => {
    setDrawerOpen(false);
    console.log(window.location.pathname);
    if (window.location.pathname === "/ticketdetails") {
      navigate("/");
    }
    if (data.type === "experience_resolved") {
      mutate({
        id: data.finalExperienceid,
      });
    }
    markNotificationReadMutate({
      id: data.id,
    });
  };
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/admin":
        return "Dashboard";
      case "/admin/":
        return "Dashboard";
      case "/admin/cm":
        return "Customer Manager";
      case "/admin/crm":
        return "Customer Relationship Manager";
      case "/admin/cmform":
        return "Create a New Customer Manager";
      case "/admin/crmform":
        return " Create a New Customer Relationship Manager";
      case "/admin/hob":
        return "Head of the Business";
      case "/admin/tasks":
        return "Tasks List";
      case "/admin/taskdetails":
        return "Task Details";
      case "/admin/taskform":
        return "Create New Task";
      case "/admin/crmdetails":
        return "Customer Relationship Manager Details";
      case "/admin/cmdetails":
        return "Customer Manager Details";
      case "/admin/organizationdetails":
        return " Organization Details";
      case "/admin/organizationform":
        return "Create a New Organization";
      case "/admin/ticketdetails":
        return " Experience Details";
      case "/admin/form":
        return "Create a New Organization";
      case "/admin/hobdetails":
        return "Head of The Department Details";
      case "/admin/allExperiences":
        return "All Experiences";
      case "/admin/organization":
        return "Organizations";
      case "/admin/newExperiences":
        return "New Experiences";
      case "/admin/pendingExperiences":
        return "Pending Experiences";
      case "/admin/resolvedExperiences":
        return "Resolved Experiences";
      case "/admin/profile":
        return "Profile";
      case "/admin/notes":
        return "Notes";
      case "/admin/calendar":
        return "Calendar";
      default:
        return "Page Not Found";
    }
  };
  const getPageTitle1 = () => {
    switch (location.pathname) {
      case "/admin":
        return { primaryTitle: "Dashboard", secondaryTitle: null };
      case "/admin/":
        return { primaryTitle: "Dashboard", secondaryTitle: null };
      case "/admin/cm":
        return { primaryTitle: "Customer Manager", secondaryTitle: null };
      case "/admin/crm":
        return {
          primaryTitle: "Customer Relationship Manager",
          secondaryTitle: null,
        };
      case "/admin/cmdetails":
        return {
          primaryTitle: "Customer Manager Details ",
          secondaryTitle: null,
        };
      case "/admin/organization":
        return { primaryTitle: "Organization", secondaryTitle: null };
      case "/admin/ticketdetails":
        return { primaryTitle: "Experience Details", secondaryTitle: null };
      case "/admin/organizationdetails":
        return { primaryTitle: "Organizations Details", secondaryTitle: null };
      case "/admin/organizationadd":
        return { primaryTitle: "Organizations Add", secondaryTitle: null };
      case "/admin/organizationform":
        return {
          primaryTitle: "Organization",
          secondaryTitle: "Create a New Organization",
        };
      case "/admin/cmform":
        return {
          primaryTitle: "Customer Manager",
          secondaryTitle: "Create a New Customer Manager",
        };
      case "/admin/crmdetails":
        return {
          primaryTitle: "Customer Relationship Manager Details ",
          secondaryTitle: null,
        };
      case "/admin/crmform":
        return {
          primaryTitle: "Customer Relationship Manager",
          secondaryTitle: "Create a New Customer Relationship Manager",
        };
      case "/admin/hob":
        return { primaryTitle: "Head of the Business", secondaryTitle: null };
      case "/admin/tasks":
        return { primaryTitle: "Tasks List", secondaryTitle: null };
      case "/admin/taskform":
        return {
          primaryTitle: "Tasks List",
          secondaryTitle: "Create a New Task",
        };
      case "/admin/taskdetails":
        return { primaryTitle: "Task Details", secondaryTitle: null };
      case "/admin/form":
        return {
          primaryTitle: "Head of the Business",
          secondaryTitle: "Create a New Head of the Business Unit",
        };
      case "/admin/hobdetails":
        return {
          primaryTitle: "Head of The Business Details",
          secondaryTitle: null,
        };
      case "/admin/allExperiences":
        return { primaryTitle: "All Experiences", secondaryTitle: null };
      case "/admin/newExperiences":
        return { primaryTitle: "New Experiences", secondaryTitle: null };
      case "/admin/pendingExperiences":
        return { primaryTitle: "Pending Experiences", secondaryTitle: null };
      case "/admin/resolvedExperiences":
        return { primaryTitle: "Resolved Experiences", secondaryTitle: null };
      case "/admin/profile":
        return { primaryTitle: "Profile", secondaryTitle: null };
      case "/admin/notes":
        return { primaryTitle: "Notes", secondaryTitle: null };
      case "/admin/calendar":
        return { primaryTitle: "Calendar", secondaryTitle: null };
      default:
        return { primaryTitle: "Page Not Found", secondaryTitle: null };
    }
  };

  const { primaryTitle, secondaryTitle } = getPageTitle1();

  // const pageTitle = getPageTitle();
  // const [primaryTitle, secondaryTitle] = pageTitle.includes(" / ") ? pageTitle.split(" / ") : [pageTitle, ""];

  // Sync selected state with sessionStorage
  useEffect(() => {
    const storedSelected = sessionStorage.getItem("selectedSidebarItem");
    if (storedSelected) {
      setSelected(storedSelected);
    }
  }, []);

  useEffect(() => {
    setSelected(getActivePage(location.pathname));
    sessionStorage.setItem(
      "selectedSidebarItem",
      getActivePage(location.pathname)
    );
  }, [location.pathname]);

  const logoSrc = logoLight;

  // const getGreeting = () => {
  //   const hour = new Date().getHours();
  //   if (hour < 12) return "Good Morning";
  //   if (hour < 18) return "Good Afternoon";
  //   return "Good Evening";
  // };
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const CustomDivider = () => (
    <Box
      sx={{
        width: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FontAwesomeIcon icon={faAngleRight} /> {/* Custom divider icon */}
    </Box>
  );

  // const handleLogout = () => {
  //   // Clear the token from localStorage
  //   localStorage.removeItem('token');

  //   // Call the parent logout handler if provided
  //   if (onLogout) onLogout();

  //   // Navigate to login page
  //   navigate('/login');

  //   // Optional: Force a full page reload to reset the application state

  // };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    onLogout();
    window.location.reload();
    navigate("/admin/login");
  };

  return (
    <Box
      width="100%"
      sx={{
        bgcolor: "#fefefe !important",
        overflowX: "hidden",
      }}
    >
      {/* Topbar Container */}
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        bgcolor="#ffffff"
        sx={{
          overflowX: "hidden",
          flex: 1,
          marginTop: 1,
          background: "ffffff",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Header Section */}
        {isMobile && (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexShrink={0}
            width="100%"
            sx={{
              bgcolor: "#fefefe !important",
              boxShadow: "0px 4px 4px -2px rgba(0, 0, 0, 0.1)",
              // marginBottom: 2,
              // padding: null,
            }}
          >
            {/* Logo on Mobile */}
            <Box
              sx={{
                maxWidth: "200px",
                height: "65px",
                backgroundColor: "#fefefe !important",
              }}
            >
              <img
                src={logoSrc}
                alt="logo"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>

            {/* Mobile Menu Icon */}
            <IconButton onClick={() => setIsModalOpen(true)}>
              <MenuOutlinedIcon sx={{ fontSize: 30 }} />
            </IconButton>
          </Box>
        )}

        {/* Greeting and Profile Section */}
        {isMobile ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            flexShrink={0}
            sx={{
              bgcolor: "transparent",
              paddingX: isMobile ? 2 : 9,
              paddingY: 1,
              boxShadow: "0px 4px 4px -2px rgba(0, 0, 0, 0.1)",
              padding: 1,
            }}
          >
            {/* Greeting Message */}
            <Box
              borderRadius="3px"
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "fit-content",
                padding: "8px",
                paddingLeft: isMobile ? "12px" : "20px",
                textAlign: isMobile ? "center" : "left",
              }}
            >
              {/* <Typography sx={{ color: "#8d8d8d", fontSize: isMobile ? "30px" : "25px" }}>
                {getGreeting()} Delphin
              </Typography> */}
              <Typography
                sx={{ color: "#8d8d8d", fontSize: isMobile ? "16px" : "16px" }}
              >
                {currentTime.toLocaleString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </Typography>
            </Box>

            {/* Profile Section */}
            <Box
              borderRadius="3px"
              sx={{
                display: "flex",
                width: "fit-content",
                alignItems: "center",
              }}
            >
              <IconButton sx={{ gap: 1 }} onClick={handleNotificationsClick}>
                <Box
                  sx={{
                    width: isMobile ? 25 : 30,
                    height: isMobile ? 25 : 30,
                    borderRadius: "50%",
                    backgroundColor: colors.blueAccent[500],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <NotificationsIcon
                    sx={{ fontSize: isMobile ? 18 : 20, color: "#fff" }}
                  />
                </Box>
                {/* <Typography sx={{ color: "#000", fontSize: isMobile ? 15 : 17 }}>
                  Delphin
                </Typography> */}
              </IconButton>
              <IconButton
                onClick={() => navigate("/admin/profile")}
                sx={{ gap: 1 }}
              >
                <Box
                  sx={{
                    width: isMobile ? 25 : 30,
                    height: isMobile ? 25 : 30,
                    borderRadius: "50%",
                    backgroundColor: colors.blueAccent[500],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PersonIcon
                    sx={{ fontSize: isMobile ? 18 : 20, color: "#fff" }}
                  />
                </Box>
                <Typography
                  sx={{ color: "#000", fontSize: isMobile ? 15 : 17 }}
                >
                  {userDetails.firstname} {userDetails.lastname}
                </Typography>
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            flexShrink={0}
            sx={{
              bgcolor: "#ffffff",
              paddingX: isMobile ? 2 : 4,
              paddingLeft: 35,
            }}
          >
            {/* Greeting Message */}
            <Box
              borderRadius="3px"
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "fit-content",
                padding: "8px",
                paddingRight: "30px",
                paddingLeft: isMobile ? "12px" : "20px",
                textAlign: isMobile ? "center" : "left",
              }}
            >
              {/* <Typography sx={{ color: "#8d8d8d", fontSize: isMobile ? "20px" : "25px" }}>
                {getGreeting()} Delphin
              </Typography> */}
              <Typography
                sx={{ color: "#8d8d8d", fontSize: isMobile ? "14px" : "16px" }}
              >
                {currentTime.toLocaleString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </Typography>
            </Box>

            {/* Profile Section */}
            <Box
              borderRadius="3px"
              sx={{
                display: "flex",
                width: "fit-content",
                alignItems: "center",
              }}
            >
              <IconButton sx={{ gap: 1 }} onClick={handleNotificationsClick}>
                <Badge badgeContent={unreadCount} color="error">
                  <Box
                    sx={{
                      width: isMobile ? 25 : 30,
                      height: isMobile ? 25 : 30,
                      borderRadius: "50%",
                      backgroundColor: colors.blueAccent[500],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <NotificationsIcon
                      sx={{ fontSize: isMobile ? 18 : 20, color: "#fff" }}
                    />
                  </Box>
                </Badge>
              </IconButton>
              <IconButton
                onClick={() => navigate("/admin/profile")}
                sx={{ gap: 1 }}
              >
                <Box
                  sx={{
                    width: isMobile ? 25 : 30,
                    height: isMobile ? 25 : 30,
                    borderRadius: "50%",
                    backgroundColor: colors.blueAccent[500],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PersonIcon
                    sx={{ fontSize: isMobile ? 18 : 20, color: "#fff" }}
                  />
                </Box>
                <Typography
                  sx={{ color: "#000", fontSize: isMobile ? 15 : 17 }}
                >
                  {userDetails.firstname} {userDetails.lastname}
                </Typography>
              </IconButton>
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <Alert
                  onClose={() => setSnackbarOpen(false)}
                  severity="info"
                  sx={{ width: "100%" }}
                >
                  {snackbarMsg}
                </Alert>
              </Snackbar>
            </Box>
          </Box>
        )}

        {/* Page Title Section */}
        {isMobile ? (
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            flexShrink={0}
            sx={{
              backgroundColor: colors.blueAccent[700],
              paddingX: isMobile ? 2 : 4,
              boxShadow: "0px 4px 8px -2px rgba(62, 67, 150, 0.5)",
              padding: "20px",
            }}
          >
            {/* Greeting Message */}
            <Box
              borderRadius="3px"
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "fit-content",
                padding: "8px",
                paddingLeft: isMobile ? "12px" : "20px",
                textAlign: isMobile ? "text" : "text",
              }}
            >
              <Typography
                sx={{
                  color: "#ffffff",
                  fontSize: isMobile ? "20px" : "20px",
                  fontWeight: "bold",
                }}
              >
                {getPageTitle()}
              </Typography>
              <Box
                sx={{
                  color: "#ffffff",
                  alignItems: "center",
                  gap: 1,
                  display: "flex",
                }}
              >
                <HomeOutlinedIcon
                  onClick={() => navigate("/admin")}
                  fontSize="small"
                  sx={{ cursor: "pointer" }}
                />

                <CustomDivider />
                <Typography>{getPageTitle()}</Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            flexShrink={0}
            sx={{
              backgroundColor: colors.blueAccent[500],
              paddingX: isMobile ? 2 : 4,
              paddingLeft: 35,
            }}
          >
            {/* Greeting Message */}
            <Box
              borderRadius="3px"
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "fit-content",
                padding: "8px",
                paddingLeft: isMobile ? "12px" : "20px",
              }}
            >
              <Typography
                sx={{
                  color: "#ffffff",
                  fontSize: isMobile ? "17px" : "20px",
                  fontWeight: "bold",
                }}
              >
                {primaryTitle}
              </Typography>
              <Box
                sx={{
                  color: "#ffffff",
                  alignItems: "center",
                  gap: 1,
                  display: "flex",
                }}
              >
                <HomeOutlinedIcon
                  onClick={() => navigate("/admin")}
                  fontSize="small"
                  sx={{ cursor: "pointer" }}
                />
                <CustomDivider />
                <Typography
                  sx={{ cursor: "pointer", fontSize: "14px" }}
                  onClick={secondaryTitle ? () => navigate(-1) : undefined}
                >
                  {primaryTitle}
                </Typography>
                {secondaryTitle && (
                  <>
                    <CustomDivider />
                    <Typography
                      sx={{ cursor: "pointer", fontSize: "14px" }}
                      onClick={() => navigate(location.pathname)}
                    >
                      {secondaryTitle}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{ width: isMobile ? 250 : 350, padding: 2 }}
          role="presentation"
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Notifications
          </Typography>
          <List>
            {notificationList && notificationList.data.length === 0 && (
              <ListItem>
                <ListItemText primary="No notifications yet." />
              </ListItem>
            )}
            {notificationList &&
              notificationList.data.map((notif, idx) => (
                <ListItem
                  sx={{
                    cursor: "pointer",
                    marginBottom: "8px",
                    "&:hover": {
                      backgroundColor: colors.grey[700],
                      color: "white",
                    },
                  }}
                  className=""
                  onClick={() => notifClick(notif)}
                  key={idx}
                  divider
                >
                  <ListItemText
                    primary={notif.title || "Notification"}
                    secondary={
                      <>
                        <span>{notif.message}</span>
                        <br />
                        <span style={{ fontSize: 12, color: "#888" }}>
                          {notif.timestamp
                            ? new Date(notif.created_at).toLocaleString()
                            : ""}
                        </span>
                      </>
                    }
                  />
                </ListItem>
              ))}
          </List>
        </Box>
      </Drawer>
      <Box sx={{ alignItems: "center" }}>
        {/* Mobile Sidebar Modal */}
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" }, // Semi-transparent black backdrop
          }}
        >
          <Box
            width="100%"
            sx={{
              background: colors.primary[400],
              height: "100vh",
              position: "absolute",
              left: 0,
              top: "10%",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              overflow: "hidden",
              boxShadow: "4px 0px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Item
              title="Dashboard"
              to="/admin"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              handleClose={() => setIsModalOpen(false)}
            />
            <Item
              title="Customer Manager"
              to="/admin/cm"
              icon={<PeopleAltOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              handleClose={() => setIsModalOpen(false)}
            />
            <Item
              title="Customer Relationship Manager"
              to="/admin/crm"
              icon={<HandshakeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              handleClose={() => setIsModalOpen(false)}
            />
            <Item
              title="Head of the Business"
              to="/admin/hob"
              icon={<StorefrontOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              handleClose={() => setIsModalOpen(false)}
            />
            <Item
              title="Organization"
              to="/admin/organization"
              icon={<BusinessOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              handleClose={() => setIsModalOpen(false)}
            />
            {/* <Item title="Tasks" to="/tasks" icon={<TaskOutlinedIcon />} selected={selected} setSelected={setSelected} handleClose={() => setIsModalOpen(false)} /> */}
            <Item
              title="Notes"
              to="/admin/notes"
              icon={<DescriptionOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              handleClose={() => setIsModalOpen(false)}
            />
            <Item
              title="Calendar"
              to="/admin/calendar"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              handleClose={() => setIsModalOpen(false)}
            />
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                color: colors.blueAccent[500],
                borderRadius: "10px",
                marginBottom: "8px",
                "&:hover": {
                  backgroundColor: colors.blueAccent[700],
                  color: "white",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <LogoutOutlinedIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                sx={{
                  "& .MuiTypography-root": {
                    fontWeight: "bold !important",
                    fontSize: "15px",
                  },
                }}
              />
            </ListItem>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default Topbar;
