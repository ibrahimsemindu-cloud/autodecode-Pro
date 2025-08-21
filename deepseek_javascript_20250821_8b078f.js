// AutoDecode Pro - Main Application Logic
function appData() {
    return {
        // Application State
        isLoading: true,
        activeTab: 'live',
        make: '',
        model: '',
        year: '',
        vinInput: '',
        isDecodingVIN: false,
        isConnected: false,
        isConnecting: false,
        isScanning: false,
        isLoggingData: false,
        liveData: { engine: {}, fuel: {}, system: {}, dtc: [] },
        loggedData: [],
        userProfile: { name: '', email: '', tier: 'free' },

        // Initialize the app
        init() {
            console.log("AutoDecode Pro Initialized");
            // Simulate loading process
            setTimeout(() => {
                this.isLoading = false;
                this.loadUserProfile();
            }, 1500);
        },

        // Load user profile from localStorage
        loadUserProfile() {
            const savedProfile = localStorage.getItem('autodecode_profile');
            if (savedProfile) {
                this.userProfile = JSON.parse(savedProfile);
            }
        },

        // Save user profile to localStorage
        saveUserProfile() {
            localStorage.setItem('autodecode_profile', JSON.stringify(this.userProfile));
        },

        // VIN Decoding
        async decodeVIN() {
            this.isDecodingVIN = true;
            try {
                // Use free NHTSA API for beta - replace with professional API for production
                const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${this.vinInput}?format=json`);
                const data = await response.json();
                
                if (data.Results) {
                    const make = data.Results.find(r => r.Variable === "Make")?.Value;
                    const model = data.Results.find(r => r.Variable === "Model")?.Value;
                    const year = data.Results.find(r => r.Variable === "Model Year")?.Value;
                    
                    if (make && make !== "Invalid") this.make = make;
                    if (model && model !== "Invalid") this.model = model;
                    if (year && year !== "Invalid") this.year = year;
                    
                    if (!make || make === "Invalid") {
                        alert("VIN decoded, but make not found. Please select manually.");
                    }
                }
            } catch (error) {
                console.error("VIN decoding error:", error);
                alert("VIN decoding failed. Please check the VIN or try manual entry.");
            } finally {
                this.isDecodingVIN = false;
            }
        },

        // OBD2 Connection Management
        async initOBD2() {
            if (this.isConnected) {
                this.disconnectOBD2();
                return;
            }

            this.isConnecting = true;
            try {
                // Web Bluetooth API implementation would go here
                // This is a simplified simulation for the beta
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Simulate connection success
                this.isConnected = true;
                this.addNotification("Scanner connected successfully", "success");
                
            } catch (error) {
                console.error("Connection error:", error);
                this.addNotification("Connection failed: " + error.message, "error");
            } finally {
                this.isConnecting = false;
            }
        },

        disconnectOBD2() {
            this.isConnected = false;
            this.isScanning = false;
            this.liveData = { engine: {}, fuel: {}, system: {}, dtc: [] };
            this.addNotification("Scanner disconnected", "info");
        },

        // Data Scanning
        startAdvancedScanning() {
            this.isScanning = !this.isScanning;
            if (this.isScanning) {
                this.liveDataInterval = setInterval(() => {
                    // Simulate live data - replace with actual OBD2 commands
                    this.liveData.engine['010C'] = { value: Math.floor(Math.random() * 3000) + 800, unit: 'RPM' };
                    this.liveData.engine['010D'] = { value: Math.floor(Math.random() * 120), unit: 'km/h' };
                    this.liveData.engine['0104'] = { value: Math.floor(Math.random() * 100), unit: '%' };
                    this.liveData.engine['0105'] = { value: Math.floor(Math.random() * 40) + 70, unit: '°C' };
                }, 500);
            } else {
                clearInterval(this.liveDataInterval);
            }
        },

        // Trouble Codes
        scanTroubleCodes() {
            // Simulate code scanning - replace with actual OBD2 mode 3
            const shouldHaveCodes = Math.random() > 0.6;
            this.liveData.dtc = shouldHaveCodes ? ['P0300', 'P0420', 'P0171'] : [];
            
            const message = shouldHaveCodes ? 
                "Trouble codes found" : "No trouble codes detected";
            this.addNotification(message, shouldHaveCodes ? "warning" : "success");
        },

        clearTroubleCodes() {
            // Simulate code clearing - replace with actual OBD2 mode 4
            this.liveData.dtc = [];
            this.addNotification("Trouble codes cleared", "success");
        },

        // Notification System
        addNotification(message, type = "info") {
            // Implementation for a notification system
            console.log(`[${type.toUpperCase()}] ${message}`);
            // You would integrate with a notification UI component here
        },

        // Utility Methods
        years() {
            const currentYear = new Date().getFullYear();
            return Array.from({length: 30}, (_, i) => currentYear - i);
        },

        // Car Database (Abbreviated)
        modelLists: {
            "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "Sienna", "4Runner", "Tundra", "Prius"],
            "Honda": ["Civic", "Accord", "CR-V", "Pilot", "Fit", "Odyssey", "HR-V", "Passport", "Ridgeline"],
            "Ford": ["F-150", "Focus", "Escape", "Explorer", "Mustang", "Fusion", "Edge", "Ranger", "Expedition"],
            "Chevrolet": ["Silverado", "Malibu", "Equinox", "Tahoe", "Camaro", "Cruze", "Traverse", "Impala", "Colorado"],
            "BMW": ["3 Series", "5 Series", "7 Series", "X3", "X5", "X7", "i3", "i8", "Z4"],
            // ... more manufacturers
        }
    };
}

// Initialize the app when Alpine is ready
document.addEventListener('alpine:init', () => {
    Alpine.data('appData', appData);
});