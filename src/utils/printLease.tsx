import React from 'react';
import { createRoot } from 'react-dom/client';
import { OntarioLeaseDisplay } from '@/components/lease/OntarioLeaseDisplay';
import { OntarioLeaseContract } from '@/types/ontarioLease';

export const printOntarioLease = (contract: OntarioLeaseContract) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to print the lease.');
        return;
    }

    printWindow.document.write('<html><head><title>Ontario Lease Agreement</title></head><body><div id="print-root"></div></body></html>');
    printWindow.document.close();

    // Copy styles
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(style => {
        printWindow.document.head.appendChild(style.cloneNode(true));
    });

    // Add specific print styles
    const style = printWindow.document.createElement('style');
    style.innerHTML = `
    body { padding: 20px; -webkit-print-color-adjust: exact; }
    @media print {
      .no-print { display: none !important; }
      Button { display: none !important; }
    }
  `;
    printWindow.document.head.appendChild(style);

    const container = printWindow.document.getElementById('print-root');
    if (container) {
        const root = createRoot(container);
        // Render the display component in view-only mode
        root.render(
            <OntarioLeaseDisplay
                contract={contract}
                onSign={() => { }}
                onDownload={() => { }}
                isSigned={true} // Removes the "Sign Contract" button layout usually
            />
        );

        // Wait for styles/images to load then print
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 1000);
    }
};
