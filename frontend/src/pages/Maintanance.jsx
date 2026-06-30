export default function MaintenancePage({ settings }) {
  const loadedSettings = settings ?? JSON.parse(localStorage.getItem("adminSettings"))?.settings ?? {};

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6fb",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 15,
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)",
          maxWidth: 500,
        }}
      >
        <h1>{loadedSettings.maintenanceTitle || 'System Under Maintenance'}</h1>

        <p>{loadedSettings.maintenanceMessage || 'We are performing scheduled maintenance. Please try again later.'}</p>
      </div>
    </div>
  );
}