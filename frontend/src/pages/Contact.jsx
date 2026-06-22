import React from "react";

const Contact = () => {
  return (
    <section className="bg-sky-100 py-16">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <h2 className="text-3xl font-bold text-center text-slate-900">
          Contact Us
        </h2>
        <p className="mt-3 text-center text-slate-700">
          We’re here to support you. Feel free to reach out anytime.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-8 rounded-xl shadow">
          
          {/* Left Side - Contact Info */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Get in Touch
            </h3>
            <p className="text-slate-700 mb-4">
              Have any questions or need medical support?  
              Our team is always ready to help you with appointments and guidance.
            </p>

            <div className="space-y-3 text-slate-700">
              <p>
                <b>Address:</b> Chattogram, Bangladesh
              </p>
              <p>
                <b>Email:</b> ezmediway@gmail.com
              </p>
              <p>
                <b>Phone:</b> +880 123 456 789
              </p>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Send a Message
            </h3>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-300"
              />

              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-300"
              />

              <textarea
                rows="3"
                placeholder="Your Message"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-300"
              ></textarea>

              <button
                type="submit"
                className="bg-gray-600 text-white px-5 py-2 rounded hover:bg-gray-700 transition"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
