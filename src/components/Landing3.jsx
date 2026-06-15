import React from 'react';

export default function Page3() {
  return (
    <div className="min-h-screen page bg-gradient-to-br from-purple-800 via-indigo-900 to-black flex flex-col justify-between text-white">

      {/* Main content placeholder */}
      <div className="flex-grow flex justify-center items-center">
        {/* Empty page for future content */}
      </div>

      {/* Footer Section */}
      <footer className="bg-black/80 py-6 px-8 mt-6 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Contact Links */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Contact</h3>
            <ul className="space-y-1 text-sm">
              <li>Phone: 01942272144</li>
              <li>Email: <a href="mailto:info@uok.edu.in" className="hover:text-purple-400 transition-colors">info@uok.edu.in</a></li>
              <li>
                <a href="https://itss.uok.edu.in/Main/ViewPage.aspx?Page=a297f6ca-2298-4d90-8505-fca9edc175ad#bottom&active=lnk5" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="https://itss.uok.edu.in/Main/PeopleList.aspx" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                  Faculty & Staff
                </a>
              </li>
              <li>
                <a href="https://itss.uok.edu.in/Main/ViewPage.aspx?Page=c081df22-9d30-4fc6-9da9-dbc08a819bfa" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                  IT Centers and Staff
                </a>
              </li>
            </ul>
          </div>

          {/* About Us and Developer */}
          <div className="md:col-span-3 flex flex-col md:flex-row gap-6">
            
            {/* About Text Scrollable */}
            <div className="flex-1 max-h-48 overflow-y-auto pr-4">
              <h3 className="text-xl font-semibold mb-2">About Us</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line">
                Profile of Directorate of Information Technology & Support System

                Directorate of Information Technology and Support System (DITSS) was set up in the University of Kashmir in December 2007 with a view to have an IT support in place and automate the operations of various administrative, examination and academic units of the University. The establishment of the Directorate is to ensure active contribution of the University in the development of the society through the capitalization of opportunities associated with the Information Technology. The Directorate is to serve as a central resource for capitalizing the enormous opportunities associated with Information Technology. After a proper evaluation, the Ministry of Communication and Information Technology sanctioned the e-Governance project at a total outlay of INR 4.43 crores. The project was aimed to execute e-Governance in the examination system of the University and to provide connectivity of e-Governance system practices to all affiliated colleges and departments of the University. After successful implementation of e-governance examination system, the Ministry of Communication and Information Technology sanctioned another project of INR 7.73 crores was sanctioned to implement e-Governance in University and Higher Education.

                The establishment of the Directorate is planned with following major objectives:

                Achieve excellence in three areas of Information Technology which includes Multimedia Systems, Software Development & DBMS.
                Bridge the gap between Academics & Industry through the establishment of Advanced Centre of Information Technology which shall also include development of the necessary support structure necessary for the development of the IT Industry.
                Provide IT support to the local conventional Industry by establishing Computer Aided Designing Centre.
                Implement & Manage e-Governance in the University System and provide necessary support to other Organizations in the e-governance plans.
                The present faculty strength of the directorate is 4 which include one Director & Three Information Officers/Technologists.
              </p>
            </div>

            {/* Developer Info on right */}
            <div className="flex-1 flex flex-col justify-start items-end text-right">
              <h3 className="text-lg font-semibold mb-1 text-yellow-400">Web3 Developer & Founder</h3>
              <p className="font-semibold text-white mb-1">Owais Manzoor</p>
              <p className="text-sm mb-1">Email: <a href="mailto:Bhatowais514@gmail.com" className="hover:text-yellow-400 transition-colors">Bhatowais514@gmail.com</a></p>
              <p className="text-sm">Phone: 9149705419</p>
            </div>

          </div>

        </div>
      </footer>

    </div>
  );
}







