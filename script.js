(function () {
      'use strict';

      /* ----------------------------------------------------------------------
         1. SIMULATED TRANSIT DATASET
         ---------------------------------------------------------------------- */
      const TRANSIT_ROUTES = [
        {
          id: 'R-101',
          number: 'B-101',
          type: 'Bus',
          name: 'City Express Loop',
          origin: 'Central Station',
          destination: 'Downtown Civic Center',
          firstDeparture: '05:30 AM',
          frequency: '10 mins',
          duration: '25 mins',
          stops: 8,
          fare: 2.50,
          crowdPercent: 32,
          crowdLevel: 'Low'
        },
        {
          id: 'R-202',
          number: 'M-01',
          type: 'Metro',
          name: 'Blue Metro Line',
          origin: 'Central Station',
          destination: 'Tech Park North',
          firstDeparture: '05:00 AM',
          frequency: '5 mins',
          duration: '18 mins',
          stops: 6,
          fare: 3.25,
          crowdPercent: 78,
          crowdLevel: 'High'
        },
        {
          id: 'R-303',
          number: 'A-500',
          type: 'Bus',
          name: 'Airport Connector Express',
          origin: 'Central Station',
          destination: 'International Airport',
          firstDeparture: '04:30 AM',
          frequency: '15 mins',
          duration: '35 mins',
          stops: 4,
          fare: 6.00,
          crowdPercent: 52,
          crowdLevel: 'Moderate'
        },
        {
          id: 'R-404',
          number: 'M-02',
          type: 'Metro',
          name: 'Silver Metro Corridor',
          origin: 'Harborfront Terminal',
          destination: 'International Airport',
          firstDeparture: '05:15 AM',
          frequency: '7 mins',
          duration: '28 mins',
          stops: 9,
          fare: 4.50,
          crowdPercent: 61,
          crowdLevel: 'Moderate'
        },
        {
          id: 'R-505',
          number: 'U-12',
          type: 'Bus',
          name: 'University Campus Shuttle',
          origin: 'Westside Mall',
          destination: 'University Campus',
          firstDeparture: '06:00 AM',
          frequency: '12 mins',
          duration: '22 mins',
          stops: 7,
          fare: 2.00,
          crowdPercent: 84,
          crowdLevel: 'High'
        },
        {
          id: 'R-606',
          number: 'C-300',
          type: 'Bus',
          name: 'City Circular Route',
          origin: 'Eastgate Business District',
          destination: 'Harborfront Terminal',
          firstDeparture: '06:15 AM',
          frequency: '15 mins',
          duration: '40 mins',
          stops: 14,
          fare: 2.75,
          crowdPercent: 28,
          crowdLevel: 'Low'
        }
      ];

      const SERVICE_ALERTS = [
        {
          id: 'ALT-01',
          category: 'Disruption',
          title: 'Signal Upgrade Delay on Blue Metro Line',
          route: 'M-01 • Blue Metro Line',
          timestamp: 'Today, 08:15 AM',
          description: 'Trains between Central Station and Tech Park North are experiencing 6–8 minute delays due to automated signal calibration.'
        },
        {
          id: 'ALT-02',
          category: 'Information',
          title: 'Upcoming Public Holiday Reduced Frequency Notice',
          route: 'All Bus & Metro Routes',
          timestamp: 'Upcoming Holiday Schedule',
          description: 'On the upcoming National Public Holiday, all City Bus and Metro corridors will operate on a Sunday timetable (15–20 min intervals).'
        },
        {
          id: 'ALT-03',
          category: 'Disruption',
          title: 'Downtown Roadwork Detour (Stops 4 & 5)',
          route: 'B-101 • City Express Loop',
          timestamp: 'Today, 07:30 AM',
          description: 'Buses are temporarily diverted via 4th Avenue due to municipal utility work. Expect an extra 5 minutes of travel time.'
        },
        {
          id: 'ALT-04',
          category: 'Information',
          title: 'Extended Late-Night Airport Shuttle Service',
          route: 'A-500 • Airport Connector Express',
          timestamp: 'Effective This Week',
          description: 'Additional midnight and 01:00 AM departures have been added from Central Station to International Airport for late arrivals.'
        },
        {
          id: 'ALT-05',
          category: 'Normal Service',
          title: 'Silver Metro Corridor & Circular Routes Operating Normally',
          route: 'M-02 & C-300',
          timestamp: 'Updated 10 mins ago',
          description: 'All stations, escalators, and contactless demo fare gates are operating on regular weekday schedules with low-to-moderate occupancy.'
        }
      ];

      const STORAGE_KEY = 'transitease_demo_tickets_v1';

      /* ----------------------------------------------------------------------
         2. APPLICATION STATE & STORAGE HELPERS
         ---------------------------------------------------------------------- */
      let state = {
        activePage: 'dashboard',
        scheduleFilter: 'All',
        alertFilter: 'All',
        searchResults: [],
        selectedOption: null,
        tickets: loadTicketsFromStorage()
      };

      function loadTicketsFromStorage() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          return raw ? JSON.parse(raw) : [];
        } catch (err) {
          console.error('Failed to read tickets from LocalStorage:', err);
          return [];
        }
      }

      function saveTicketsToStorage(tickets) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
        } catch (err) {
          console.error('Failed to save tickets to LocalStorage:', err);
        }
      }

      function showToast(message) {
        const toast = document.getElementById('toastNotification');
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
          toast.classList.remove('show');
        }, 3400);
      }

      function escapeHtml(str) {
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      }

      /* ----------------------------------------------------------------------
         3. NAVIGATION & RESPONSIVE SIDEBAR
         ---------------------------------------------------------------------- */
      const PAGE_META = {
        dashboard: {
          title: 'Commuter Dashboard',
          subtitle: 'Overview of city bus, metro lines, crowd levels & tickets'
        },
        planner: {
          title: 'Journey Planner',
          subtitle: 'Search routes, compare options, and book prototype tickets'
        },
        schedules: {
          title: 'Transit Schedules',
          subtitle: 'Complete timetables and service frequencies for Bus & Metro'
        },
        crowd: {
          title: 'Crowd Status Monitor',
          subtitle: 'Simulated occupancy indicators across the transit network'
        },
        alerts: {
          title: 'Alerts & Holidays',
          subtitle: 'Service disruptions, detours, and holiday timetable notices'
        },
        tickets: {
          title: 'My Prototype Tickets',
          subtitle: 'View and manage your locally stored demo passes'
        }
      };

      function navigateTo(pageId) {
        if (!PAGE_META[pageId]) return;
        state.activePage = pageId;

        document.querySelectorAll('.page-section').forEach((sec) => {
          sec.classList.toggle('active', sec.id === `page-${pageId}`);
        });

        document.querySelectorAll('.nav-item').forEach((btn) => {
          btn.classList.toggle('active', btn.dataset.page === pageId);
        });

        document.getElementById('topbarTitle').textContent = PAGE_META[pageId].title;
        document.getElementById('topbarSubtitle').textContent = PAGE_META[pageId].subtitle;

        closeMobileSidebar();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      function openMobileSidebar() {
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('sidebarOverlay').classList.add('show');
      }

      function closeMobileSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('show');
      }

      /* ----------------------------------------------------------------------
         4. RENDERING FUNCTIONS FOR ALL 6 PAGES
         ---------------------------------------------------------------------- */
      function getCrowdBadgeClass(level) {
        if (level === 'Low') return 'badge-low';
        if (level === 'Moderate') return 'badge-moderate';
        return 'badge-high';
      }

      function renderDashboard() {
        // Update counters
        document.getElementById('statTotalRoutes').textContent = TRANSIT_ROUTES.length;
        const avgCrowd = Math.round(
          TRANSIT_ROUTES.reduce((acc, r) => acc + r.crowdPercent, 0) / TRANSIT_ROUTES.length
        );
        document.getElementById('statNetworkCrowd').textContent = `${avgCrowd}%`;
        document.getElementById('statBookedTickets').textContent = state.tickets.length;
        document.getElementById('ticketNavCount').textContent = state.tickets.length;
        document.getElementById('alertNavCount').textContent = SERVICE_ALERTS.length;

        // Render Popular Routes (Top 4)
        const popularContainer = document.getElementById('dashboardPopularRoutes');
        popularContainer.innerHTML = TRANSIT_ROUTES.slice(0, 4).map((r) => `
          <div class="route-mini-item">
            <div>
              <div style="margin-bottom:4px;">
                <span class="route-code">${escapeHtml(r.number)}</span>
                <strong>${escapeHtml(r.name)}</strong>
                <span class="badge ${r.type === 'Metro' ? 'badge-metro' : 'badge-bus'}" style="margin-left:6px;">${r.type}</span>
              </div>
              <div style="font-size:0.82rem;color:var(--text-muted);">
                ${escapeHtml(r.origin)} &rarr; ${escapeHtml(r.destination)} • Every ${r.frequency}
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="badge ${getCrowdBadgeClass(r.crowdLevel)}">${r.crowdLevel} (${r.crowdPercent}%)</span>
              <button class="btn btn-outline btn-sm" onclick="window.quickBookRoute('${r.id}')">Select</button>
            </div>
          </div>
        `).join('');

        // Render Latest Alerts (Top 3)
        const alertsContainer = document.getElementById('dashboardLatestAlerts');
        alertsContainer.innerHTML = SERVICE_ALERTS.slice(0, 3).map((a) => {
          const cls = a.category === 'Disruption' ? 'disruption' : a.category === 'Information' ? 'information' : 'normal';
          return `
            <div class="alert-mini-item ${cls}">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;gap:8px;">
                <strong style="font-size:0.88rem;">${escapeHtml(a.title)}</strong>
                <span style="font-size:0.74rem;color:var(--text-muted);white-space:nowrap;">${escapeHtml(a.timestamp)}</span>
              </div>
              <p style="font-size:0.81rem;color:var(--text-muted);">${escapeHtml(a.description)}</p>
            </div>
          `;
        }).join('');
      }

      function renderSchedules() {
        const tbody = document.getElementById('schedulesTableBody');
        const filtered = state.scheduleFilter === 'All'
          ? TRANSIT_ROUTES
          : TRANSIT_ROUTES.filter((r) => r.type === state.scheduleFilter);

        tbody.innerHTML = filtered.map((r) => `
          <tr>
            <td><strong>${escapeHtml(r.number)}</strong></td>
            <td><span class="badge ${r.type === 'Metro' ? 'badge-metro' : 'badge-bus'}">${r.type}</span></td>
            <td><strong>${escapeHtml(r.name)}</strong></td>
            <td>${escapeHtml(r.origin)} &rarr; ${escapeHtml(r.destination)}</td>
            <td>${escapeHtml(r.firstDeparture)}</td>
            <td>Every ${escapeHtml(r.frequency)}</td>
            <td>${escapeHtml(r.duration)}</td>
            <td><strong>$${r.fare.toFixed(2)}</strong></td>
          </tr>
        `).join('');
      }

      function renderCrowdStatus() {
        const avgCrowd = Math.round(
          TRANSIT_ROUTES.reduce((acc, r) => acc + r.crowdPercent, 0) / TRANSIT_ROUTES.length
        );
        const overallBadge = document.getElementById('overallCrowdBadge');
        const overallBar = document.getElementById('overallCrowdBar');
        overallBadge.textContent = `${avgCrowd}% • Moderate Crowd`;
        overallBar.style.width = `${avgCrowd}%`;

        const grid = document.getElementById('crowdStatusGrid');
        grid.innerHTML = TRANSIT_ROUTES.map((r) => {
          const fillClass = r.crowdLevel === 'Low' ? 'fill-low' : r.crowdLevel === 'Moderate' ? 'fill-moderate' : 'fill-high';
          return `
            <div class="crowd-card">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                <div>
                  <span class="route-code">${escapeHtml(r.number)}</span>
                  <span class="badge ${r.type === 'Metro' ? 'badge-metro' : 'badge-bus'}">${r.type}</span>
                  <h4 style="margin-top:8px;font-size:1rem;">${escapeHtml(r.name)}</h4>
                  <p style="font-size:0.82rem;color:var(--text-muted);">${escapeHtml(r.origin)} &rarr; ${escapeHtml(r.destination)}</p>
                </div>
                <span class="badge ${getCrowdBadgeClass(r.crowdLevel)}">${r.crowdLevel} Crowd</span>
              </div>

              <div class="progress-track">
                <div class="progress-fill ${fillClass}" style="width:${r.crowdPercent}%;"></div>
              </div>

              <div style="display:flex;justify-content:space-between;font-size:0.82rem;">
                <span style="color:var(--text-muted);">Simulated Occupancy</span>
                <strong>${r.crowdPercent}% Capacity</strong>
              </div>
            </div>
          `;
        }).join('');
      }

      function renderAlerts() {
        const grid = document.getElementById('alertsGrid');
        const filtered = state.alertFilter === 'All'
          ? SERVICE_ALERTS
          : SERVICE_ALERTS.filter((a) => a.category === state.alertFilter);

        grid.innerHTML = filtered.map((a) => {
          const cardCls = a.category === 'Disruption' ? 'disruption' : a.category === 'Information' ? 'information' : 'normal';
          const badgeCls = a.category === 'Disruption' ? 'badge-high' : a.category === 'Information' ? 'badge-moderate' : 'badge-low';
          return `
            <div class="alert-card ${cardCls}">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px;">
                  <span class="badge ${badgeCls}">${escapeHtml(a.category)}</span>
                  <span style="font-size:0.78rem;color:var(--text-muted);">${escapeHtml(a.timestamp)}</span>
                </div>
                <h4 style="font-size:1rem;margin-bottom:6px;">${escapeHtml(a.title)}</h4>
                <p style="font-size:0.86rem;color:var(--text-muted);line-height:1.55;">${escapeHtml(a.description)}</p>
              </div>
              <div style="padding-top:10px;border-top:1px solid var(--border-color);font-size:0.8rem;font-weight:600;color:var(--primary);">
                Affected: ${escapeHtml(a.route)}
              </div>
            </div>
          `;
        }).join('');
      }

      function renderTickets() {
        const container = document.getElementById('ticketsContainer');
        document.getElementById('ticketNavCount').textContent = state.tickets.length;
        document.getElementById('statBookedTickets').textContent = state.tickets.length;

        if (state.tickets.length === 0) {
          container.innerHTML = `
            <div class="empty-state">
              <div style="font-size:2.2rem;margin-bottom:10px;">🎫</div>
              <h3 style="margin-bottom:6px;">No Prototype Tickets Booked Yet</h3>
              <p style="color:var(--text-muted);max-width:420px;margin:0 auto 18px;font-size:0.9rem;">
                Use the Journey Planner to search Bus or Metro routes and generate a prototype ticket saved in your browser.
              </p>
              <button class="btn btn-primary" data-nav-target="planner">Go to Journey Planner</button>
            </div>
          `;
          return;
        }

        container.innerHTML = `
          <div class="tickets-grid">
            ${state.tickets.map((t) => `
              <div class="ticket-card">
                <div class="ticket-top">
                  <div>
                    <span style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.06em;color:#93c5fd;">Prototype Boarding Pass</span>
                    <h4 style="font-size:1.05rem;margin-top:2px;">${escapeHtml(t.routeNumber)} • ${escapeHtml(t.routeName)}</h4>
                  </div>
                  <span class="badge" style="background:rgba(255,255,255,0.16);color:#fff;">${escapeHtml(t.ticketId)}</span>
                </div>
                <div class="ticket-body">
                  <div class="ticket-row">
                    <span style="color:var(--text-muted);">Passenger</span>
                    <strong>${escapeHtml(t.passengerName)} (${t.passengerCount}x)</strong>
                  </div>
                  <div class="ticket-row">
                    <span style="color:var(--text-muted);">Route</span>
                    <strong>${escapeHtml(t.origin)} &rarr; ${escapeHtml(t.destination)}</strong>
                  </div>
                  <div class="ticket-row">
                    <span style="color:var(--text-muted);">Travel Date &amp; Time</span>
                    <strong>${escapeHtml(t.travelDate)} at ${escapeHtml(t.departureTime)}</strong>
                  </div>
                  <div class="ticket-row">
                    <span style="color:var(--text-muted);">Ticket Type</span>
                    <strong>${escapeHtml(t.ticketType)}</strong>
                  </div>
                  <div class="ticket-row">
                    <span style="color:var(--text-muted);">Total Paid (Demo)</span>
                    <strong style="color:var(--primary);font-size:1rem;">$${Number(t.totalAmount).toFixed(2)}</strong>
                  </div>
                </div>
                <div class="ticket-footer">
                  <small style="color:var(--text-muted);font-size:0.74rem;">Booked: ${escapeHtml(t.bookedAt)}</small>
                  <button class="btn btn-danger btn-sm" onclick="window.deleteTicket('${t.ticketId}')">Delete Ticket</button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }

      /* ----------------------------------------------------------------------
         5. JOURNEY PLANNER SEARCH & BOOKING LOGIC
         ---------------------------------------------------------------------- */
      function addMinutesToTime(timeStr, minsToAdd) {
        const [h, m] = timeStr.split(':').map(Number);
        const total = (h * 60 + m + minsToAdd) % (24 * 60);
        const nh = String(Math.floor(total / 60)).padStart(2, '0');
        const nm = String(total % 60).padStart(2, '0');
        return `${nh}:${nm}`;
      }

      function handleJourneySearch(e) {
        if (e) e.preventDefault();
        const origin = document.getElementById('originInput').value.trim();
        const destination = document.getElementById('destinationInput').value.trim();
        const travelDate = document.getElementById('travelDateInput').value;
        const depTime = document.getElementById('departureTimeInput').value || '09:00';

        if (!origin || !destination) {
          showToast('Please enter both starting location and destination.');
          return;
        }

        if (origin.toLowerCase() === destination.toLowerCase()) {
          showToast('Origin and destination cannot be the same.');
          return;
        }

        // Match routes or generate realistic multi-modal connections
        let matches = TRANSIT_ROUTES.filter(
          (r) =>
            r.origin.toLowerCase().includes(origin.toLowerCase()) ||
            r.destination.toLowerCase().includes(destination.toLowerCase())
        );

        if (matches.length < 2) {
          matches = TRANSIT_ROUTES.slice(0, 3);
        }

        state.searchResults = matches.map((route, idx) => {
          const offsetMins = idx * 12;
          const estDep = addMinutesToTime(depTime, offsetMins);
          const durNum = parseInt(route.duration, 10) || 25;
          const estArr = addMinutesToTime(estDep, durNum);
          return {
            optionId: `${route.id}-${idx}`,
            routeNumber: route.number,
            routeName: route.name,
            type: route.type,
            origin,
            destination,
            travelDate,
            departureTime: estDep,
            arrivalTime: estArr,
            duration: route.duration,
            stops: route.stops,
            fare: route.fare,
            crowdLevel: route.crowdLevel,
            crowdPercent: route.crowdPercent,
            frequency: route.frequency
          };
        });

        state.selectedOption = null;
        document.getElementById('bookingFormPanel').style.display = 'none';
        renderJourneyResults();
      }

      function renderJourneyResults() {
        const container = document.getElementById('journeyResultsContainer');
        if (state.searchResults.length === 0) {
          container.innerHTML = '';
          return;
        }

        container.innerHTML = state.searchResults.map((opt) => {
          const isSelected = state.selectedOption && state.selectedOption.optionId === opt.optionId;
          return `
            <div class="journey-option-card ${isSelected ? 'selected' : ''}">
              <div style="flex:1;min-width:250px;">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
                  <span class="route-code">${escapeHtml(opt.routeNumber)}</span>
                  <strong style="font-size:1.05rem;">${escapeHtml(opt.routeName)}</strong>
                  <span class="badge ${opt.type === 'Metro' ? 'badge-metro' : 'badge-bus'}">${opt.type}</span>
                  <span class="badge ${getCrowdBadgeClass(opt.crowdLevel)}">${opt.crowdLevel} Crowd (${opt.crowdPercent}%)</span>
                </div>
                <div style="font-size:0.9rem;font-weight:600;color:var(--text-main);">
                  ${escapeHtml(opt.origin)} (${opt.departureTime}) &rarr; ${escapeHtml(opt.destination)} (${opt.arrivalTime})
                </div>
                <div class="journey-meta">
                  <span>⏱ Duration: <strong>${opt.duration}</strong></span>
                  <span>🚏 Stops: <strong>${opt.stops}</strong></span>
                  <span>🔄 Frequency: <strong>Every ${opt.frequency}</strong></span>
                </div>
              </div>

              <div style="display:flex;align-items:center;gap:16px;">
                <div style="text-align:right;">
                  <div style="font-size:1.35rem;font-weight:800;color:var(--primary);">$${opt.fare.toFixed(2)}</div>
                  <small style="color:var(--text-muted);">per passenger</small>
                </div>
                <button class="btn ${isSelected ? 'btn-outline' : 'btn-primary'}" onclick="window.selectJourneyOption('${opt.optionId}')">
                  ${isSelected ? 'Selected' : 'Select & Book'}
                </button>
              </div>
            </div>
          `;
        }).join('');
      }

      function updateEstimatedPrice() {
        if (!state.selectedOption) return;
        const count = Math.max(1, parseInt(document.getElementById('passengerCountInput').value, 10) || 1);
        const type = document.getElementById('ticketTypeSelect').value;
        const multiplier = type === 'Return' ? 2 : 1;
        const total = state.selectedOption.fare * count * multiplier;
        document.getElementById('estimatedTotalPrice').textContent = `$${total.toFixed(2)}`;
      }

      window.selectJourneyOption = function (optionId) {
        const found = state.searchResults.find((o) => o.optionId === optionId);
        if (!found) return;
        state.selectedOption = found;
        renderJourneyResults();

        const panel = document.getElementById('bookingFormPanel');
        panel.style.display = 'block';
        document.getElementById('selectedRouteSummary').textContent =
          `${found.routeNumber} (${found.routeName}) • ${found.origin} to ${found.destination} on ${found.travelDate} at ${found.departureTime}`;
        updateEstimatedPrice();
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };

      window.quickBookRoute = function (routeId) {
        const route = TRANSIT_ROUTES.find((r) => r.id === routeId);
        if (!route) return;
        navigateTo('planner');
        document.getElementById('originInput').value = route.origin;
        document.getElementById('destinationInput').value = route.destination;
        handleJourneySearch();
      };

      function handleBookingSubmit(e) {
        e.preventDefault();
        if (!state.selectedOption) return;

        const passengerName = document.getElementById('passengerNameInput').value.trim();
        const passengerCount = Math.max(1, parseInt(document.getElementById('passengerCountInput').value, 10) || 1);
        const ticketType = document.getElementById('ticketTypeSelect').value;

        if (!passengerName) {
          showToast('Please enter the passenger name.');
          return;
        }

        const multiplier = ticketType === 'Return' ? 2 : 1;
        const totalAmount = state.selectedOption.fare * passengerCount * multiplier;
        const uniqueId = 'TE-' + Math.random().toString(36).substring(2, 7).toUpperCase();

        const newTicket = {
          ticketId: uniqueId,
          passengerName,
          passengerCount,
          ticketType,
          routeNumber: state.selectedOption.routeNumber,
          routeName: state.selectedOption.routeName,
          origin: state.selectedOption.origin,
          destination: state.selectedOption.destination,
          travelDate: state.selectedOption.travelDate,
          departureTime: state.selectedOption.departureTime,
          totalAmount,
          bookedAt: new Date().toLocaleString()
        };

        state.tickets.unshift(newTicket);
        saveTicketsToStorage(state.tickets);
        renderDashboard();
        renderTickets();

        document.getElementById('ticketBookingForm').reset();
        document.getElementById('bookingFormPanel').style.display = 'none';
        state.selectedOption = null;
        renderJourneyResults();

        showToast(`Booking confirmed! Prototype Ticket ${uniqueId} generated.`);
        navigateTo('tickets');
      }

      window.deleteTicket = function (ticketId) {
        state.tickets = state.tickets.filter((t) => t.ticketId !== ticketId);
        saveTicketsToStorage(state.tickets);
        renderDashboard();
        renderTickets();
        showToast(`Ticket ${ticketId} removed.`);
      };

      /* ----------------------------------------------------------------------
         6. CLIENT-SIDE ZIP PACKAGE GENERATOR (TransitEase_HTML_CSS_JS.zip)
         ---------------------------------------------------------------------- */
      async function downloadProjectZip() {
        if (typeof JSZip === 'undefined') {
          showToast('ZIP generator library unavailable offline. Save this HTML file directly.');
          return;
        }

        showToast('Preparing TransitEase_HTML_CSS_JS.zip...');

        const zip = new JSZip();
        const folder = zip.folder('TransitEase');

        const cssContent = document.getElementById('main-stylesheet').textContent.trim();
        const jsContent = document.getElementById('main-script').textContent.trim();

        // Build clean standalone index.html referencing style.css and script.js
        const docClone = document.documentElement.cloneNode(true);
        const clonedStyle = docClone.querySelector('#main-stylesheet');
        if (clonedStyle) {
          const linkTag = document.createElement('link');
          linkTag.setAttribute('rel', 'stylesheet');
          linkTag.setAttribute('href', 'style.css');
          clonedStyle.replaceWith(linkTag);
        }
        const clonedScript = docClone.querySelector('#main-script');
        if (clonedScript) {
          const scriptTag = document.createElement('script');
          scriptTag.setAttribute('src', 'script.js');
          clonedScript.replaceWith(scriptTag);
        }

        const cleanHtml = '<!DOCTYPE html>\n' + docClone.outerHTML;
        const readmeText = [
          'TransitEase — Smart Public Transportation Website',
          '==================================================',
          '',
          '1. HOW TO RUN:',
          '   - Extract the TransitEase_HTML_CSS_JS.zip archive.',
          '   - Open TransitEase/index.html directly in any modern web browser (Chrome, Edge, Firefox, Safari).',
          '   - No Node.js, npm, or external server installation is required.',
          '',
          '2. FOLDER STRUCTURE:',
          '   TransitEase/',
          '   ├── index.html   (Semantic HTML5 structure for all 6 pages)',
          '   ├── style.css    (Responsive CSS3 design system & layout)',
          '   ├── script.js    (Vanilla JS navigation, search, filters & LocalStorage ticketing)',
          '   └── README.txt   (Project documentation)',
          '',
          '3. DISCLAIMER:',
          '   All routes, schedules, crowd occupancy levels, and booked tickets are simulated prototype data.'
        ].join('\n');

        folder.file('index.html', cleanHtml);
        folder.file('style.css', cssContent);
        folder.file('script.js', jsContent);
        folder.file('README.txt', readmeText);

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TransitEase_HTML_CSS_JS.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Downloaded TransitEase_HTML_CSS_JS.zip!');
      }

      /* ----------------------------------------------------------------------
         7. INITIALIZATION & EVENT LISTENERS
         ---------------------------------------------------------------------- */
      document.addEventListener('DOMContentLoaded', () => {
        // Set default travel date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('travelDateInput').value = today;

        // Sidebar navigation clicks
        document.querySelectorAll('.nav-item').forEach((btn) => {
          btn.addEventListener('click', () => navigateTo(btn.dataset.page));
        });

        // Delegated quick-navigation buttons
        document.body.addEventListener('click', (e) => {
          const targetBtn = e.target.closest('[data-nav-target]');
          if (targetBtn) {
            navigateTo(targetBtn.dataset.navTarget);
          }
        });

        // Mobile sidebar controls
        document.getElementById('openSidebarBtn').addEventListener('click', openMobileSidebar);
        document.getElementById('closeSidebarBtn').addEventListener('click', closeMobileSidebar);
        document.getElementById('sidebarOverlay').addEventListener('click', closeMobileSidebar);

        // Schedule filter buttons
        document.getElementById('scheduleFilterBar').addEventListener('click', (e) => {
          const btn = e.target.closest('.filter-btn');
          if (!btn) return;
          document.querySelectorAll('#scheduleFilterBar .filter-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          state.scheduleFilter = btn.dataset.filter;
          renderSchedules();
        });

        // Alert filter buttons
        document.getElementById('alertFilterBar').addEventListener('click', (e) => {
          const btn = e.target.closest('.filter-btn');
          if (!btn) return;
          document.querySelectorAll('#alertFilterBar .filter-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          state.alertFilter = btn.dataset.alertFilter;
          renderAlerts();
        });

        // Journey Planner search & booking listeners
        document.getElementById('journeySearchForm').addEventListener('submit', handleJourneySearch);
        document.getElementById('passengerCountInput').addEventListener('input', updateEstimatedPrice);
        document.getElementById('ticketTypeSelect').addEventListener('change', updateEstimatedPrice);
        document.getElementById('ticketBookingForm').addEventListener('submit', handleBookingSubmit);
        document.getElementById('cancelSelectionBtn').addEventListener('click', () => {
          state.selectedOption = null;
          document.getElementById('bookingFormPanel').style.display = 'none';
          renderJourneyResults();
        });

        // ZIP Download button
        document.getElementById('downloadZipBtn').addEventListener('click', downloadProjectZip);

        // Initial render of all views
        renderDashboard();
        renderSchedules();
        renderCrowdStatus();
        renderAlerts();
        renderTickets();
        handleJourneySearch();
      });
    })();
