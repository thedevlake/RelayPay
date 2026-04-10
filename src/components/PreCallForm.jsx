import { useState } from 'react';

const ISSUE_TYPES = [
  'Transfer fees',
  'Payments',
  'Invoicing',
  'Compliance',
  'Onboarding',
  'Account issues'
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PreCallForm({ onStartCall, error, status }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    issueType: ISSUE_TYPES[0]
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailPattern.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await onStartCall({
      customer_name: formData.fullName.trim(),
      customer_email: formData.email.trim(),
      issue_type: formData.issueType
    });
    setIsSubmitting(false);
  };

  return (
    <section className="grid gap-6 lg:grid-cols-5">
      <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-6 lg:col-span-3">
        <h1 className="text-2xl font-semibold text-white">Speak with RelayPay Support</h1>
        <p className="mt-2 text-sm text-slate-300">
          Share your details before starting a secure support call with our payments team.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm text-slate-300">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-[#050913] px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-[#1e3a8a]"
              placeholder="Jane Doe"
            />
            {validationErrors.fullName ? (
              <p className="mt-1 text-xs text-red-400">{validationErrors.fullName}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-slate-300">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-[#050913] px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-[#1e3a8a]"
              placeholder="jane@company.com"
            />
            {validationErrors.email ? (
              <p className="mt-1 text-xs text-red-400">{validationErrors.email}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="issueType" className="mb-2 block text-sm text-slate-300">
              Issue Type
            </label>
            <select
              id="issueType"
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-[#050913] px-4 py-3 text-slate-100 outline-none focus:border-[#0d9488]"
            >
              {ISSUE_TYPES.map((issueType) => (
                <option key={issueType} value={issueType}>
                  {issueType}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#1e3a8a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Starting call...' : 'Start Voice Support Call'}
          </button>

          {status ? <p className="text-xs text-slate-400">Status: {status}</p> : null}
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </form>
      </div>

      <aside className="rounded-2xl border border-slate-800 bg-[#0b1220] p-6 lg:col-span-2">
        <h2 className="text-lg font-semibold text-white">What we can help with</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {ISSUE_TYPES.map((item) => (
            <li key={item} className="rounded-lg border border-slate-700 bg-[#050913] px-3 py-2">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-lg border border-slate-700 bg-[#050913] p-4">
          <p className="text-sm font-medium text-slate-200">Support hours</p>
          <p className="mt-1 text-sm text-slate-300">Monday to Friday, 9 AM to 5 PM West Africa Time</p>
        </div>
      </aside>
    </section>
  );
}
