class AlertsManager {
  constructor() {
    this.currentData = null;
    this.severityColors = {
      'VERDE': '#34c759',
      'GIALLO': '#ffcc00',
      'ARANCIONE': '#ff9500',
      'ROSSO': '#ff3b30'
    };
  }

  async loadAlertData() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (window.aiWeatherData) {
          clearInterval(checkInterval);
          this.currentData = window.aiWeatherData;
          console.log('✅ Alert data loaded:', this.currentData);
          resolve(this.currentData);
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        console.warn('⚠️ Alert data timeout');
        resolve(null);
      }, 5000);
    });
  }

  renderSummary() {
    if (!this.currentData?.summary) {
      return '<p style="color: var(--text-secondary);">Dati non disponibili</p>';
    }
    return `<p style="font-size: 1rem; line-height: 1.8; color: var(--text-primary);">${this.currentData.summary}</p>`;
  }

  renderAdvice() {
    if (!this.currentData?.advice || this.currentData.advice.length === 0) {
      return '<p style="color: var(--text-secondary);">Nessun consiglio disponibile</p>';
    }
    const adviceIcons = ['👕', '⛴️', '🏊'];
    return this.currentData.advice.map((advice, idx) => `
      <div style="background: rgba(8, 165, 232, 0.1); border: 1px solid rgba(8, 165, 232, 0.3); border-radius: 12px; padding: 1.2rem; margin-bottom: 1rem;">
        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
          <span style="font-size: 1.5rem; flex-shrink: 0;">${adviceIcons[idx] || '💡'}</span>
          <p style="margin: 0; font-size: 0.95rem; line-height: 1.6; color: var(--text-primary);">${advice}</p>
        </div>
      </div>
    `).join('');
  }

  renderAlerts() {
    if (!this.currentData?.alerts || this.currentData.alerts.length === 0) {
      return `
        <div style="background: rgba(52, 199, 89, 0.1); border: 1px solid rgba(52, 199, 89, 0.3); border-radius: 12px; padding: 1.5rem; text-align: center;">
          <p style="font-size: 1.1rem; color: #34c759; margin: 0;">✓ Nessuna criticità</p>
        </div>
      `;
    }

    return this.currentData.alerts.map((alert, idx) => {
      const severity = alert.severity || 'VERDE';
      const color = this.severityColors[severity] || '#08a5e8';
      const bgColor = {
        'VERDE': 'rgba(52, 199, 89, 0.1)',
        'GIALLO': 'rgba(255, 204, 0, 0.1)',
        'ARANCIONE': 'rgba(255, 149, 0, 0.1)',
        'ROSSO': 'rgba(255, 59, 48, 0.1)'
      }[severity];
      const borderColor = {
        'VERDE': 'rgba(52, 199, 89, 0.3)',
        'GIALLO': 'rgba(255, 204, 0, 0.3)',
        'ARANCIONE': 'rgba(255, 149, 0, 0.3)',
        'ROSSO': 'rgba(255, 59, 48, 0.3)'
      }[severity];
      const icons = { 'VERDE': '✓', 'GIALLO': '⚠', 'ARANCIONE': '⚠⚠', 'ROSSO': '🚨' };

      return `
        <div style="background: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 0.75rem;">
            <span style="font-size: 1.8rem; flex-shrink: 0;">${icons[severity] || '📍'}</span>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 0.25rem 0; font-size: 1rem; color: ${color}; font-weight: 600; text-transform: uppercase;">${alert.type}</h4>
              <div style="display: inline-block; background: ${color}; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase;">${severity}</div>
            </div>
          </div>
          <p style="margin: 0; font-size: 0.95rem; line-height: 1.6; color: var(--text-primary);">${alert.description}</p>
        </div>
      `;
    }).join('');
  }

  openModal(type) {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (!modalOverlay) return;

    const icons = { 'summary': '📋', 'advice': '💡', 'alerts': '🚨' };
    const titles = { 'summary': 'Riepilogo Giornata', 'advice': 'Consigli del Giorno', 'alerts': 'Allerte Meteo' };
    const contents = { 'summary': () => this.renderSummary(), 'advice': () => this.renderAdvice(), 'alerts': () => this.renderAlerts() };

    modalIcon.textContent = icons[type];
    modalTitle.textContent = titles[type];
    modalBody.innerHTML = contents[type]();
    modalOverlay.classList.add('active');
  }

  closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('active');
  }
}

const alertsManager = new AlertsManager();
document.addEventListener('DOMContentLoaded', async () => {
  await alertsManager.loadAlertData();
});
