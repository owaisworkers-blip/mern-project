import { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function EventTicket({ registration, user, onDownload, onReady }) {
  const ticketRef = useRef(null);

  const downloadTicket = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        padding: 20
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
      
      // Calculate dimensions with proper margins
      const pageWidth = 297; // A4 landscape width in mm
      const pageHeight = 210; // A4 landscape height in mm
      const margin = 15; // 15mm margin on all sides
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the image if it's smaller than content area
      const x = margin;
      const y = margin + (contentHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      const fileName = `${registration.event?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_ticket.pdf`;
      pdf.save(fileName);
      
      if (onDownload) onDownload();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  useEffect(() => {
    if (typeof onReady === 'function') onReady(downloadTicket);
  }, [onReady]);

  const event = registration.event;
  const eventDate = new Date(event?.date);
  const registrationDate = new Date(registration.createdAt);

  return (
    <div className="relative">
      {/* Ticket Design */}
      <div
        ref={ticketRef}
        className="rounded-3xl overflow-hidden shadow-2xl mx-auto border-8 border-white dark:border-slate-800"
        style={{ width: '980px', padding: '20px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #4f46e5)' }}
      >
        <div className="relative flex" style={{ minHeight: '360px' }}>
          {/* Left main area */}
          <div className="flex-1 p-8 text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full"></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Top brand row */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm tracking-widest text-fuchsia-300 font-bold">EVENT MANAGER</div>
                  <div className="text-xs text-indigo-200 mt-1">Official Event Ticket</div>
                </div>
                <div className="text-4xl">🎟️</div>
              </div>

              {/* Event title */}
              <div className="mb-6">
                <div className="text-4xl font-extrabold tracking-wide drop-shadow-lg">{event?.title}</div>
                <div className="text-cyan-300 font-semibold mt-2 text-lg flex items-center">
                  <span className="mr-2">🎪</span>
                  {event?.category} EVENT
                </div>
              </div>

              {/* Big date/time row */}
              <div className="flex items-end gap-8 mb-6">
                <div className="text-3xl font-extrabold tracking-wide drop-shadow-lg">
                  <div className="text-sm font-normal text-indigo-200 mb-1">DATE</div>
                  {eventDate.toLocaleDateString('en-GB')}
                </div>
                <div className="text-3xl font-extrabold tracking-wide drop-shadow-lg">
                  <div className="text-sm font-normal text-indigo-200 mb-1">TIME</div>
                  {eventDate.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
              <div className="uppercase tracking-widest text-cyan-300 mb-6 flex items-center">
                <span className="mr-2">📍</span>
                {event?.location}
              </div>

              {/* Barcode */}
              <div className="flex items-center mt-8 pt-4 border-t border-white/20">
                <div className="h-16 w-56 bg-[repeating-linear-gradient(90deg,_#fff_0,_#fff_2px,_transparent_2px,_transparent_4px)] rounded"></div>
                <div className="ml-4 text-sm text-indigo-200">
                  <div className="font-semibold">Ticket ID</div>
                  <div className="font-mono">{registration._id?.slice(-8).toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Perforation divider */}
          <div className="w-0.5 bg-white/40 relative">
            <div className="absolute inset-y-6 left-0 right-0 border-l-2 border-dashed border-white/70"></div>
          </div>

          {/* Right stub */}
          <div className="w-64 p-6 text-white flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #312e81, #1e3a8a)' }}>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
            {/* Vertical date/time */}
            <div className="text-cyan-300 text-base font-bold mb-5 tracking-widest text-center" style={{ textShadow: '0 0 10px rgba(103, 232, 249, 0.5)' }}>
              <div className="text-xs text-indigo-200 mb-1">EVENT DATE & TIME</div>
              <div className="text-lg font-extrabold">
                {eventDate.getDate().toString().padStart(2, '0')} {(eventDate.getMonth() + 1).toString().padStart(2, '0')} {eventDate.getFullYear()}
              </div>
              <div className="text-lg font-extrabold mt-1">
                {eventDate.getHours().toString().padStart(2, '0')}:{eventDate.getMinutes().toString().padStart(2, '0')}
              </div>
            </div>

            {/* QR */}
            <div className="bg-white/10 rounded-xl p-4 mb-4 text-center flex-1 flex flex-col justify-center">
              <div className="text-indigo-100 text-sm mb-3 font-semibold">ENTRY QR</div>
              {registration.qrCodeDataUrl ? (
                <img src={registration.qrCodeDataUrl} alt="QR" className="mx-auto w-40 h-40 rounded-md bg-white p-2" />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-40 h-40 mx-auto" />
              )}
              <div className="text-xs text-indigo-200 mt-3">Scan at entry</div>
            </div>

            {/* User info */}
            <div className="text-center mb-4 p-2 bg-white/10 rounded-lg">
              <div className="text-xs text-indigo-200">Registered by</div>
              <div className="font-semibold truncate">{user?.name}</div>
              <div className="text-xs text-indigo-200 truncate">{user?.email}</div>
            </div>

            {/* Footer small */}
            <div className="mt-auto text-center text-[10px] text-indigo-100/80">
              <div className="font-semibold">EventManager</div>
              <div>© 2025 All rights reserved</div>
              <div className="opacity-70">www.eventmanager.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
