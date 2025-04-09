const Spinner = () => {
    const spinnerStyles = {
        "--_m": `
          conic-gradient(#0000 10%,#000),
          linear-gradient(#000 0 0) content-box`,
        WebkitMask: "var(--_m)",
        mask: "var(--_m)",
        WebkitMaskComposite: "source-out",
        maskComposite: "subtract",
      };

return (
    <div className="w-5 h-5 p-1 rounded-full bg-white animate-spin loader" style={spinnerStyles}>

    </div>
)
}

export default Spinner