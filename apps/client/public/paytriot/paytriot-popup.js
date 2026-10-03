/**
 * Paytriot Secure Payments Popup Overlay Integration SDK
 * Version 1.0.0
 * 
 * Provides a clean API to open Paytriot's Hosted Payment Page in a secure modal overlay or separate popup window.
 */

(function (window, document) {
    'use strict';

    // Prevent double initialization
    if (window.PaytriotCheckout) {
        return;
    }

    const DEFAULT_GATEWAY_URL = 'https://gateway.paytriot.co.uk/paymentform/';
    const DEFAULT_LOGO_HTML = `<img src="paytriotlogo.svg" alt="Paytriot" class="paytriot-modal-logo" style="height: 30px; width: auto;" onerror="this.onerror=null; this.src='Paytriotlogo.png';" />`;

    class PaytriotCheckoutInstance {
        constructor() {
            this.overlay = null;
            this.container = null;
            this.iframe = null;
            this.spinner = null;
            this.form = null;
            this.options = {};
            this.isInitialized = false;
            
            // Popup mode properties
            this.paymentWindow = null;
            this.monitorInterval = null;
            this.usePopup = true;

            // DOM components for popup view
            this.popupContent = null;
            this.popupStatusIcon = null;
            this.popupTitle = null;
            this.popupDesc = null;
            this.popupActionBtn = null;

            // Register secure cross-window redirection message listener
            window.addEventListener('message', (event) => {
                if (event.origin !== window.location.origin) return;
                if (event.data && event.data.action === 'paytriot_redirect') {
                    this.close(false); // Success callback, do not trigger onClose cancel
                    if (event.data.url) {
                        window.location.href = event.data.url;
                    }
                }
            });
        }

        /**
         * Initialize the modal DOM elements if not already present.
         * @private
         */
        _initDOM(logoUrl) {
            if (this.isInitialized) {
                // If already initialized, update the logo if necessary
                const logoContainer = document.getElementById('paytriot-logo-wrapper');
                if (logoContainer) {
                    logoContainer.innerHTML = this._getLogoHtml(logoUrl);
                }
                return;
            }

            // Create overlay elements
            const overlayHtml = `
                <div id="paytriot-modal-overlay" class="paytriot-modal-overlay" role="dialog" aria-modal="true" aria-label="Complete Payment">
                    <div id="paytriot-modal-container" class="paytriot-modal-container">
                        
                        <!-- Header with Secure Badge and Close Button -->
                        <div class="paytriot-modal-header">
                            <div id="paytriot-logo-wrapper">
                                ${this._getLogoHtml(logoUrl)}
                            </div>
                            <div class="paytriot-modal-right-section">
                                <span class="paytriot-modal-secure-badge">
                                    <svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="1" y="5.5" width="9" height="7" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
                                        <path d="M3 5.5V3.5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                                    </svg>
                                    Secure
                                </span>
                            </div>
                        </div>

                        <!-- Body enclosing the loading spinner, the payment iframe, and the popup overlay content -->
                        <div class="paytriot-modal-body">
                            <div id="paytriot-spinner-container" class="paytriot-spinner-container">
                                <div class="paytriot-spinner"></div>
                                <div>Loading secure payment...</div>
                            </div>
                            <iframe id="paytriot-payment-frame" name="paytriot-payment-frame" class="paytriot-payment-frame" frameBorder="0" allowtransparency="true" allow="payment *" allowpaymentrequest></iframe>
                            
                            <!-- Popup Mode Info View -->
                            <div id="paytriot-popup-content" class="paytriot-popup-content hidden">
                                <div id="paytriot-popup-status-icon" class="paytriot-popup-status-icon"></div>
                                <h3 id="paytriot-popup-title">Secure Payment Window Open</h3>
                                <p id="paytriot-popup-description">Please complete your transaction in the secure popup window.</p>
                                <button id="paytriot-popup-action-btn" class="paytriot-popup-btn">Reopen Window</button>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="paytriot-modal-footer">
                            <span class="paytriot-modal-footer-text">Powered by Paytriot Secure Payments</span>
                        </div>

                    </div>
                </div>

                <!-- Hidden form targeted at the payment frame or popup -->
                <form id="paytriot-post-form" method="post" target="paytriot-payment-frame" style="display: none;"></form>
            `;

            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = overlayHtml.trim();

            // Append modal elements to document body
            while (tempContainer.firstChild) {
                document.body.appendChild(tempContainer.firstChild);
            }

            // Reference elements
            this.overlay = document.getElementById('paytriot-modal-overlay');
            this.container = document.getElementById('paytriot-modal-container');
            this.iframe = document.getElementById('paytriot-payment-frame');
            this.spinner = document.getElementById('paytriot-spinner-container');
            this.form = document.getElementById('paytriot-post-form');

            // Reference popup-specific components
            this.popupContent = document.getElementById('paytriot-popup-content');
            this.popupStatusIcon = document.getElementById('paytriot-popup-status-icon');
            this.popupTitle = document.getElementById('paytriot-popup-title');
            this.popupDesc = document.getElementById('paytriot-popup-description');
            this.popupActionBtn = document.getElementById('paytriot-popup-action-btn');

            // Set up load listener on iframe to hide spinner (Iframe Mode fallback only)
            this.iframe.addEventListener('load', () => {
                if (this.spinner && !this.usePopup) {
                    this.spinner.classList.add('hidden');
                }
            });

            this.isInitialized = true;
        }

        /**
         * Helper to get logo markup depending on configuration.
         * @private
         */
        _getLogoHtml(logoUrl) {
            if (logoUrl && logoUrl.trim() !== '') {
                return `<img src="${logoUrl}" alt="Merchant Logo" class="paytriot-modal-logo" />`;
            }
            return DEFAULT_LOGO_HTML;
        }

        /**
         * Pre-opens a centered blank popup window synchronously inside click handlers.
         */
        initPopup() {
            const w = 520;
            const h = 750;
            const left = (window.screen.width / 2) - (w / 2);
            const top = (window.screen.height / 2) - (h / 2);
            this.paymentWindow = window.open('about:blank', 'PaytriotPaymentPopup', `width=${w},height=${h},top=${top},left=${left},scrollbars=yes,resizable=yes`);
            
            // Pre-initialize DOM overlay elements
            this._initDOM();
        }

        /**
         * Helper to show blocked popup UI.
         * @private
         */
        _showBlockedUI() {
            if (this.iframe) this.iframe.classList.add('hidden');
            if (this.spinner) this.spinner.classList.add('hidden');
            if (this.popupContent) {
                this.popupContent.classList.remove('hidden');

                if (this.popupStatusIcon) {
                    this.popupStatusIcon.className = 'paytriot-popup-status-icon blocked';
                    this.popupStatusIcon.innerHTML = `
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    `;
                }

                if (this.popupTitle) this.popupTitle.innerText = 'Payment Window Blocked';
                if (this.popupDesc) this.popupDesc.innerText = 'The secure payment window was blocked by your browser. Please click the button below to open it manually.';

                if (this.popupActionBtn) {
                    this.popupActionBtn.innerText = 'Open Payment Window';
                    this.popupActionBtn.onclick = (e) => {
                        e.preventDefault();
                        const w = 520;
                        const h = 750;
                        const left = (window.screen.width / 2) - (w / 2);
                        const top = (window.screen.height / 2) - (h / 2);
                        this.paymentWindow = window.open('about:blank', 'PaytriotPaymentPopup', `width=${w},height=${h},top=${top},left=${left},scrollbars=yes,resizable=yes`);
                        
                        this._showProcessingUI();
                        this._startCloseMonitor();

                        setTimeout(() => {
                            this.form.submit();
                        }, 50);
                    };
                }
            }
        }

        /**
         * Helper to show secure processing/open popup UI.
         * @private
         */
        _showProcessingUI() {
            if (this.iframe) this.iframe.classList.add('hidden');
            if (this.spinner) this.spinner.classList.add('hidden');
            if (this.popupContent) {
                this.popupContent.classList.remove('hidden');

                if (this.popupStatusIcon) {
                    this.popupStatusIcon.className = 'paytriot-popup-status-icon processing';
                    this.popupStatusIcon.innerHTML = `
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    `;
                }

                if (this.popupTitle) this.popupTitle.innerText = 'Secure Payment Window Open';
                if (this.popupDesc) this.popupDesc.innerText = 'Please complete your transaction in the secure popup window.';

                if (this.popupActionBtn) {
                    this.popupActionBtn.innerText = 'Reopen Window';
                    this.popupActionBtn.onclick = (e) => {
                        e.preventDefault();
                        if (this.paymentWindow && !this.paymentWindow.closed) {
                            this.paymentWindow.focus();
                        } else {
                            const w = 520;
                            const h = 750;
                            const left = (window.screen.width / 2) - (w / 2);
                            const top = (window.screen.height / 2) - (h / 2);
                            this.paymentWindow = window.open('about:blank', 'PaytriotPaymentPopup', `width=${w},height=${h},top=${top},left=${left},scrollbars=yes,resizable=yes`);
                            this._startCloseMonitor();
                            setTimeout(() => {
                                this.form.submit();
                            }, 50);
                        }
                    };
                }
            }
        }

        /**
         * Monitor if the customer closed the popup window manually.
         * @private
         */
        _startCloseMonitor() {
            if (this.monitorInterval) {
                clearInterval(this.monitorInterval);
            }
            this.monitorInterval = setInterval(() => {
                if (this.paymentWindow && this.paymentWindow.closed) {
                    clearInterval(this.monitorInterval);
                    this.monitorInterval = null;
                    this.close(true); // Closed manually by customer, trigger cancellation callback
                }
            }, 1000);
        }

        /**
         * Opens the payment popup/iframe.
         * @param {Object} config Config parameters
         * @param {Object} config.fields Key-value pairs containing transaction details, signature, and merchantID.
         * @param {string} [config.gatewayUrl] Hosted payment endpoint.
         * @param {string} [config.logoUrl] Optional custom logo image URL.
         * @param {boolean} [config.usePopup] Defaults to true. If false, falls back to iframe mode.
         * @param {function} [config.onClose] Optional callback triggered on manual cancellation.
         */
        open(config) {
            if (!config || !config.fields) {
                console.error('PaytriotCheckout.open() missing required parameters: fields');
                return;
            }

            this.options = config;
            this.usePopup = config.usePopup !== false;

            // 1. Initialize DOM elements
            this._initDOM(config.logoUrl);

            // Clean up pre-opened popup if iframe fallback is explicitly requested
            if (!this.usePopup && this.paymentWindow && !this.paymentWindow.closed) {
                this.paymentWindow.close();
            }

            // 2. Clear old form inputs
            this.form.innerHTML = '';

            // 3. Reset iframe and spinner
            if (this.iframe) this.iframe.src = 'about:blank';
            if (this.spinner) this.spinner.classList.remove('hidden');

            // 4. Inject transaction parameters as hidden fields
            const fieldsData = config.fields;
            Object.keys(fieldsData).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = fieldsData[key];
                this.form.appendChild(input);
            });

            // 5. Determine Gateway URL
            const actionUrl = config.gatewayUrl || DEFAULT_GATEWAY_URL;
            this.form.action = actionUrl;

            // 6. Lock background scroll
            document.body.classList.add('paytriot-modal-open');

            // 7. Show Modal Overlay (activate transition)
            this.overlay.classList.add('active');

            if (this.usePopup) {
                // Set form target to target the popup window
                this.form.target = 'PaytriotPaymentPopup';

                // Try to check if paymentWindow is already open (pre-opened). If not, open it.
                if (!this.paymentWindow || this.paymentWindow.closed) {
                    const w = 520;
                    const h = 750;
                    const left = (window.screen.width / 2) - (w / 2);
                    const top = (window.screen.height / 2) - (h / 2);
                    this.paymentWindow = window.open('about:blank', 'PaytriotPaymentPopup', `width=${w},height=${h},top=${top},left=${left},scrollbars=yes,resizable=yes`);
                }

                // Check for popup blocker
                const isBlocked = !this.paymentWindow || this.paymentWindow.closed || typeof this.paymentWindow.closed === 'undefined';

                if (isBlocked) {
                    this._showBlockedUI();
                } else {
                    this._showProcessingUI();
                    this._startCloseMonitor();

                    // Submit form into popup
                    setTimeout(() => {
                        this.form.submit();
                    }, 50);
                }
            } else {
                // Iframe fallback Mode
                this.form.target = 'paytriot-payment-frame';
                if (this.iframe) this.iframe.classList.remove('hidden');
                if (this.spinner) this.spinner.classList.remove('hidden');
                if (this.popupContent) this.popupContent.classList.add('hidden');

                // Submit form into iframe
                setTimeout(() => {
                    this.form.submit();
                }, 50);
            }
        }

        /**
         * Closes the payment popup/modal.
         * @param {boolean} [isCancel] Defaults to false. If true, triggers onClose callback.
         */
        close(isCancel = false) {
            if (!this.overlay) return;

            // Clear close monitor
            if (this.monitorInterval) {
                clearInterval(this.monitorInterval);
                this.monitorInterval = null;
            }

            // Close popup window if it is still open
            if (this.paymentWindow && !this.paymentWindow.closed) {
                this.paymentWindow.close();
            }

            // Trigger onClose callback if provided and it is a manual cancellation
            if (isCancel && typeof this.options.onClose === 'function') {
                try {
                    this.options.onClose();
                } catch (e) {
                    console.error('Error executing onClose callback:', e);
                }
            }

            // Remove active overlay class
            this.overlay.classList.remove('active');

            // Unlock scroll
            document.body.classList.remove('paytriot-modal-open');

            // Reset components after closing animations complete
            setTimeout(() => {
                if (this.iframe) this.iframe.src = 'about:blank';
                if (this.spinner) this.spinner.classList.remove('hidden');
                if (this.popupContent) this.popupContent.classList.add('hidden');
            }, 350);
        }
    }

    // Export to global namespace
    window.PaytriotCheckout = new PaytriotCheckoutInstance();

})(window, document);
