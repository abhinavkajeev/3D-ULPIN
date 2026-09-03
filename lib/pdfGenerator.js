// Client-side PDF generation using browser print API
// Creates a styled property certificate in a new window for print/save

export function generateCertificatePDF(ulpinData) {
  const printWindow = window.open('', '_blank', 'width=800,height=1000');
  if (!printWindow) {
    alert('Please allow popups to download the certificate');
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>3D Property Certificate — ${ulpinData.ulpin}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: #f8fafc;
      color: #1e293b;
      padding: 40px;
    }

    .certificate {
      max-width: 700px;
      margin: 0 auto;
      background: white;
      border: 3px solid #0f172a;
      border-radius: 12px;
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: white;
      padding: 30px;
      text-align: center;
    }

    .header .emblem {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .header h1 {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .header p {
      font-size: 11px;
      opacity: 0.7;
      margin-top: 4px;
    }

    .body {
      padding: 30px;
    }

    .ulpin-box {
      background: linear-gradient(135deg, #f0f9ff, #ede9fe);
      border: 2px dashed #6366f1;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin-bottom: 24px;
    }

    .ulpin-box .label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #6366f1;
      font-weight: 600;
    }

    .ulpin-box .ulpin {
      font-family: 'JetBrains Mono', monospace;
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: 3px;
      margin-top: 8px;
    }

    .section-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #6366f1;
      font-weight: 600;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }

    .field .label {
      font-size: 9px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 500;
    }

    .field .value {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-top: 2px;
    }

    .field .value.mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }

    .spatial-box {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .footer {
      text-align: center;
      padding: 16px 30px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      font-size: 9px;
      color: #94a3b8;
    }

    .qr-placeholder {
      width: 80px;
      height: 80px;
      background: #e2e8f0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 24px;
    }

    .signature-line {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      padding-top: 20px;
    }

    .signature-line .sig {
      text-align: center;
      width: 200px;
    }

    .signature-line .sig .line {
      border-top: 1px solid #94a3b8;
      padding-top: 6px;
      font-size: 10px;
      color: #64748b;
    }

    @media print {
      body { padding: 0; background: white; }
      .certificate { border: none; box-shadow: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align:center;margin-bottom:20px">
    <button onclick="window.print()" style="padding:10px 30px;background:#6366f1;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="certificate">
    <div class="header">
      <div class="emblem">🏛️</div>
      <h1>3D Property Certificate</h1>
      <p>Government of Tamil Nadu • Department of Land Resources</p>
      <p>Unique Land Parcel Identification Number (3D Extended)</p>
    </div>

    <div class="body">
      <div class="ulpin-box">
        <p class="label">3D ULPIN (Bhu-Aadhaar Extended)</p>
        <p class="ulpin">${ulpinData.ulpin}</p>
      </div>

      <p class="section-title">Property Details</p>
      <div class="grid">
        <div class="field">
          <p class="label">Owner</p>
          <p class="value">${ulpinData.metadata.owner}</p>
        </div>
        <div class="field">
          <p class="label">Status</p>
          <p class="value" style="color: ${ulpinData.metadata.status === 'verified' ? '#22c55e' : '#f59e0b'}">${ulpinData.metadata.status.toUpperCase()}</p>
        </div>
        <div class="field">
          <p class="label">Property Type</p>
          <p class="value">${ulpinData.metadata.landUse}</p>
        </div>
        <div class="field">
          <p class="label">Market Value</p>
          <p class="value">₹${(ulpinData.metadata.marketValue / 100000).toFixed(2)} Lakhs</p>
        </div>
        <div class="field">
          <p class="label">Registration Date</p>
          <p class="value">${ulpinData.metadata.registrationDate}</p>
        </div>
        <div class="field">
          <p class="label">Area</p>
          <p class="value">${ulpinData.spatial.unit.area} sq.ft</p>
        </div>
      </div>

      <p class="section-title">3D Spatial Information</p>
      <div class="spatial-box">
        <div class="grid">
          <div class="field">
            <p class="label">Latitude</p>
            <p class="value mono">${ulpinData.spatial.coordinates.lat.toFixed(6)}°N</p>
          </div>
          <div class="field">
            <p class="label">Longitude</p>
            <p class="value mono">${ulpinData.spatial.coordinates.lon.toFixed(6)}°E</p>
          </div>
          <div class="field">
            <p class="label">Floor</p>
            <p class="value">Floor ${ulpinData.spatial.floor.number}</p>
          </div>
          <div class="field">
            <p class="label">Elevation Range</p>
            <p class="value mono">${ulpinData.spatial.unit.boundingBox.minElevation.toFixed(1)}m — ${ulpinData.spatial.unit.boundingBox.maxElevation.toFixed(1)}m</p>
          </div>
        </div>
      </div>

      <p class="section-title">ULPIN Segments</p>
      <div class="grid" style="grid-template-columns: repeat(4, 1fr)">
        ${Object.entries(ulpinData.segments).map(([key, seg]) => `
          <div class="field" style="text-align:center">
            <p class="label">${key}</p>
            <p class="value mono" style="color:${seg.color}">${seg.code}</p>
          </div>
        `).join('')}
      </div>

      <div class="qr-placeholder">📱</div>

      <div class="signature-line">
        <div class="sig">
          <div class="line">Registering Officer</div>
        </div>
        <div class="sig">
          <div class="line">Digital Signature</div>
        </div>
      </div>
    </div>

    <div class="footer">
      Certificate ID: CERT-${Date.now().toString(36).toUpperCase()} •
      Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} •
      Digitally Signed • Tamper-Proof Record<br/>
      3D ULPIN Cadastral Portal — Ministry of Rural Development, Government of India
    </div>
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
