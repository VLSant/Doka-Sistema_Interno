/* @ds-bundle: {"format":3,"namespace":"DokaDesignSystem_7dbee8","components":[{"name":"Avatar","sourcePath":"components/display/Avatar.jsx"},{"name":"Badge","sourcePath":"components/display/Badge.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"StatCard","sourcePath":"components/display/StatCard.jsx"},{"name":"Tag","sourcePath":"components/display/Tag.jsx"},{"name":"ProgressTracker","sourcePath":"components/feedback/ProgressTracker.jsx"},{"name":"StatusPill","sourcePath":"components/feedback/StatusPill.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"IconButton","sourcePath":"components/forms/IconButton.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"assets/icons/icons.jsx":"6e18bcae2611","components/display/Avatar.jsx":"dbbda8b63cfe","components/display/Badge.jsx":"2feb4b4b73b9","components/display/Card.jsx":"3a5937a03fe1","components/display/StatCard.jsx":"69d8a44c8d10","components/display/Tag.jsx":"3ab836ae9974","components/feedback/ProgressTracker.jsx":"f51f74b831ce","components/feedback/StatusPill.jsx":"68b120614189","components/forms/Button.jsx":"98c74c9f3c59","components/forms/Checkbox.jsx":"48c538170fe6","components/forms/IconButton.jsx":"7e0b88be420b","components/forms/Input.jsx":"cee210ae30e6","components/forms/Select.jsx":"64f6fea63dda","components/forms/Switch.jsx":"c896f91fde31","components/navigation/Tabs.jsx":"62c729e640e6","ui_kits/operations-dashboard/DashboardView.jsx":"b9d9a5b07a82","ui_kits/operations-dashboard/Shell.jsx":"fe8a084250c9","ui_kits/operations-dashboard/ShipmentDetail.jsx":"b1f5298d9c2c","ui_kits/operations-dashboard/ShipmentsView.jsx":"6f80cdc4203a","ui_kits/operations-dashboard/data.js":"b5da1fc0c4dc","ui_kits/tracking-portal/TrackingPortal.jsx":"45f356f6bd96"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DokaDesignSystem_7dbee8 = window.DokaDesignSystem_7dbee8 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// assets/icons/icons.jsx
try { (() => {
/* Doka icon set — Lucide (ISC license), the brand's chosen iconography:
   rounded joins, 2px stroke, 24px grid. Curated subset embedded as path data.
   Usage:  <Icon name="truck" size={20} />   (registers window.Icon) */
(function () {
  const P = {
    home: '<path d="M3 9.5 12 3l9 6.5"/><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/><path d="M9 21v-6h6v6"/>',
    package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    warehouse: '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    arrowUp: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    box: '<rect width="18" height="18" x="3" y="3" rx="2"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    phone: '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.4z"/>',
    weight: '<circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>'
  };
  function Icon({
    name,
    size = 20,
    color = 'currentColor',
    strokeWidth = 2,
    style
  }) {
    return React.createElement('svg', {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color,
      strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      style: {
        flex: 'none',
        ...style
      },
      dangerouslySetInnerHTML: {
        __html: P[name] || ''
      }
    });
  }
  window.Icon = Icon;
  window.DokaIconNames = Object.keys(P);
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/icons/icons.jsx", error: String((e && e.message) || e) }); }

// components/display/Avatar.jsx
try { (() => {
/** Doka Avatar — image or initials, optional status dot. Plum fallback. */
function Avatar({
  src,
  name = '',
  size = 'md',
  status,
  style
}) {
  const dims = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64
  };
  const d = dims[size] || 40;
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const statusColors = {
    online: 'var(--green-500)',
    busy: 'var(--red-500)',
    away: 'var(--amber-500)',
    offline: 'var(--neutral-400)'
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      flex: 'none',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: d,
      height: d,
      borderRadius: '50%',
      overflow: 'hidden',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--purple-500)',
      color: '#fff',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: d * 0.4
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials || '·'), status && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: -1,
      bottom: -1,
      width: d * 0.28,
      height: d * 0.28,
      minWidth: 8,
      minHeight: 8,
      borderRadius: '50%',
      background: statusColors[status] || 'var(--neutral-400)',
      border: '2px solid var(--surface-card)'
    }
  }));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/display/Badge.jsx
try { (() => {
/**
 * Doka Badge — small label/count. `tone` sets the color, `soft` for tinted bg vs solid.
 * tones: neutral | brand | purple | success | info | warning | danger.
 */
function Badge({
  children,
  tone = 'neutral',
  soft = true,
  dot = false,
  style
}) {
  const map = {
    neutral: {
      solid: 'var(--neutral-700)',
      soft: 'var(--neutral-100)',
      softFg: 'var(--neutral-700)'
    },
    brand: {
      solid: 'var(--orange-500)',
      soft: 'var(--orange-50)',
      softFg: 'var(--orange-700)'
    },
    purple: {
      solid: 'var(--purple-500)',
      soft: 'var(--purple-50)',
      softFg: 'var(--purple-600)'
    },
    success: {
      solid: 'var(--green-500)',
      soft: 'var(--green-50)',
      softFg: 'var(--green-600)'
    },
    info: {
      solid: 'var(--blue-500)',
      soft: 'var(--blue-50)',
      softFg: 'var(--blue-600)'
    },
    warning: {
      solid: 'var(--amber-500)',
      soft: 'var(--amber-50)',
      softFg: 'var(--amber-600)'
    },
    danger: {
      solid: 'var(--red-500)',
      soft: 'var(--red-50)',
      softFg: 'var(--red-600)'
    }
  };
  const c = map[tone] || map.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: dot ? '3px 9px 3px 7px' : '3px 9px',
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 'var(--text-xs)',
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
      background: soft ? c.soft : c.solid,
      color: soft ? c.softFg : '#fff',
      ...style
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: soft ? c.solid : '#fff'
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Doka Card — the base surface. Soft plum-tinted shadow, rounded, optional padding & hover lift. */
function Card({
  children,
  padding = 'md',
  interactive = false,
  style,
  onClick,
  ...rest
}) {
  const pads = {
    none: 0,
    sm: 'var(--space-4)',
    md: 'var(--space-6)',
    lg: 'var(--space-7)'
  };
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-card)',
      padding: pads[padding] ?? pads.md,
      boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      transform: hover ? 'translateY(var(--hover-lift))' : 'none',
      cursor: interactive ? 'pointer' : 'default',
      transition: 'box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/StatCard.jsx
try { (() => {
/**
 * Doka StatCard — a KPI tile. Big Poppins number, optional delta and icon accent.
 * `tone` colors the icon chip: brand | purple | success | info | warning | danger.
 */
function StatCard({
  label,
  value,
  unit,
  delta,
  deltaDir = 'up',
  icon,
  tone = 'brand',
  style
}) {
  const tones = {
    brand: {
      bg: 'var(--orange-50)',
      fg: 'var(--orange-600)'
    },
    purple: {
      bg: 'var(--purple-50)',
      fg: 'var(--purple-500)'
    },
    success: {
      bg: 'var(--green-50)',
      fg: 'var(--green-600)'
    },
    info: {
      bg: 'var(--blue-50)',
      fg: 'var(--blue-600)'
    },
    warning: {
      bg: 'var(--amber-50)',
      fg: 'var(--amber-600)'
    },
    danger: {
      bg: 'var(--red-50)',
      fg: 'var(--red-600)'
    }
  };
  const t = tones[tone] || tones.brand;
  const positive = deltaDir === 'up';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-6)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)'
    }
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 'var(--radius-sm)',
      background: t.bg,
      color: t.fg,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--text-4xl)',
      lineHeight: 1,
      color: 'var(--text-strong)',
      letterSpacing: '-0.02em'
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 'var(--text-lg)',
      color: 'var(--text-muted)'
    }
  }, unit)), delta != null && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 'var(--text-xs)',
      background: positive ? 'var(--green-50)' : 'var(--red-50)',
      color: positive ? 'var(--green-600)' : 'var(--red-600)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      transform: positive ? 'none' : 'rotate(180deg)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "m6 15 6-6 6 6"
  })), delta), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-subtle)'
    }
  }, "vs last week")));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/display/Tag.jsx
try { (() => {
/** Doka Tag — neutral chip for categories/filters, optionally removable. */
function Tag({
  children,
  onRemove,
  icon,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 6px 5px 11px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--neutral-100)',
      border: '1px solid var(--border-subtle)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)',
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      color: 'var(--text-muted)'
    }
  }, icon), children, onRemove && /*#__PURE__*/React.createElement("button", {
    onClick: onRemove,
    "aria-label": "Remove",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 18,
      height: 18,
      border: 'none',
      background: 'transparent',
      borderRadius: 'var(--radius-xs)',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      padding: 0
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'var(--neutral-200)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'transparent';
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }))));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressTracker.jsx
try { (() => {
/**
 * Doka ProgressTracker — horizontal stepper for a shipment journey.
 * `steps`: [{label, sub?}]. `current` = index of the active step (0-based).
 * Completed steps fill orange; the active step pulses subtly.
 */
function ProgressTracker({
  steps = [],
  current = 0,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      width: '100%',
      ...style
    }
  }, steps.map((step, i) => {
    const done = i < current;
    const active = i === current;
    const reached = done || active;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 'none',
        width: 96,
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 28,
        height: 28,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: done ? 'var(--brand-primary)' : active ? 'var(--surface-card)' : 'var(--neutral-100)',
        border: active ? '2px solid var(--brand-primary)' : done ? '2px solid var(--brand-primary)' : '2px solid var(--border-default)',
        color: done ? '#fff' : active ? 'var(--brand-primary)' : 'var(--text-subtle)',
        boxShadow: active ? '0 0 0 4px var(--orange-50)' : 'none',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 13
      }
    }, done ? /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "3.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20 6 9 17l-5-5"
    })) : i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        marginTop: 8,
        fontFamily: 'var(--font-sans)',
        fontWeight: reached ? 700 : 600,
        fontSize: 'var(--text-xs)',
        color: reached ? 'var(--text-strong)' : 'var(--text-subtle)'
      }
    }, step.label), step.sub && /*#__PURE__*/React.createElement("span", {
      style: {
        marginTop: 2,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-muted)'
      }
    }, step.sub)), i < steps.length - 1 && /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 2,
        background: 'var(--neutral-200)',
        marginTop: 13,
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        width: i < current ? '100%' : '0%',
        background: 'var(--brand-primary)',
        borderRadius: 2,
        transition: 'width var(--dur-slow) var(--ease-standard)'
      }
    })));
  }));
}
Object.assign(__ds_scope, { ProgressTracker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressTracker.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StatusPill.jsx
try { (() => {
/**
 * Doka StatusPill — the canonical shipment-status indicator. Maps a status key
 * to brand status color + label. Use everywhere a package state is shown.
 */
const STATUS = {
  delivered: {
    label: 'Delivered',
    fg: 'var(--green-600)',
    bg: 'var(--green-50)',
    dot: 'var(--status-delivered)'
  },
  transit: {
    label: 'In transit',
    fg: 'var(--blue-600)',
    bg: 'var(--blue-50)',
    dot: 'var(--status-transit)'
  },
  out: {
    label: 'Out for delivery',
    fg: 'var(--orange-700)',
    bg: 'var(--orange-50)',
    dot: 'var(--orange-500)'
  },
  delayed: {
    label: 'Delayed',
    fg: 'var(--amber-600)',
    bg: 'var(--amber-50)',
    dot: 'var(--status-delayed)'
  },
  exception: {
    label: 'Exception',
    fg: 'var(--red-600)',
    bg: 'var(--red-50)',
    dot: 'var(--status-exception)'
  },
  pending: {
    label: 'Pending',
    fg: 'var(--neutral-600)',
    bg: 'var(--neutral-100)',
    dot: 'var(--status-pending)'
  }
};
function StatusPill({
  status = 'pending',
  label,
  size = 'md',
  style
}) {
  const s = STATUS[status] || STATUS.pending;
  const sm = size === 'sm';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: sm ? 5 : 6,
      padding: sm ? '3px 9px 3px 8px' : '5px 12px 5px 10px',
      borderRadius: 'var(--radius-pill)',
      background: s.bg,
      color: s.fg,
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: sm ? 'var(--text-xs)' : 'var(--text-sm)',
      lineHeight: 1.3,
      whiteSpace: 'nowrap',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: sm ? 6 : 7,
      height: sm ? 6 : 7,
      borderRadius: '50%',
      background: s.dot,
      flex: 'none'
    }
  }), label || s.label);
}
Object.assign(__ds_scope, { StatusPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StatusPill.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Doka Button — the brand's primary action control.
 * Rounded, confident, with a subtle press-shrink and orange glow on primary hover.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  style,
  ...rest
}) {
  const sizes = {
    sm: {
      height: 'var(--control-h-sm)',
      padding: '0 14px',
      font: 'var(--text-sm)',
      gap: '6px',
      radius: 'var(--radius-sm)'
    },
    md: {
      height: 'var(--control-h-md)',
      padding: '0 18px',
      font: 'var(--text-base)',
      gap: '8px',
      radius: 'var(--radius-md)'
    },
    lg: {
      height: 'var(--control-h-lg)',
      padding: '0 24px',
      font: 'var(--text-md)',
      gap: '10px',
      radius: 'var(--radius-md)'
    }
  };
  const variants = {
    primary: {
      background: 'var(--brand-primary)',
      color: 'var(--brand-on-primary)',
      border: '1px solid transparent'
    },
    secondary: {
      background: 'var(--purple-600)',
      color: '#fff',
      border: '1px solid transparent'
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-strong)',
      border: '1px solid var(--border-default)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-body)',
      border: '1px solid transparent'
    },
    danger: {
      background: 'var(--red-500)',
      color: '#fff',
      border: '1px solid transparent'
    }
  };
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;
  const isDisabled = disabled || loading;
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const hoverBg = {
    primary: 'var(--brand-primary-hover)',
    secondary: 'var(--purple-700)',
    outline: 'var(--neutral-100)',
    ghost: 'var(--neutral-100)',
    danger: 'var(--red-600)'
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: isDisabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      width: fullWidth ? '100%' : 'auto',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: s.font,
      lineHeight: 1,
      borderRadius: s.radius,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)',
      ...v,
      background: hover && !isDisabled ? hoverBg : v.background,
      boxShadow: variant === 'primary' && hover && !isDisabled ? 'var(--shadow-brand)' : 'none',
      transform: active && !isDisabled ? 'scale(var(--press-scale))' : 'none',
      opacity: isDisabled ? 0.5 : 1,
      ...style
    }
  }, rest), loading && /*#__PURE__*/React.createElement(Spinner, null), !loading && leftIcon, children, !loading && rightIcon);
}
function Spinner() {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: 14,
      height: 14,
      borderRadius: '50%',
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      display: 'inline-block',
      animation: 'doka-spin 0.6s linear infinite'
    }
  }, /*#__PURE__*/React.createElement("style", null, `@keyframes doka-spin{to{transform:rotate(360deg)}}`));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
/** Doka Checkbox — rounded square, orange when checked. */
function Checkbox({
  checked = false,
  onChange,
  disabled = false,
  label,
  id,
  style
}) {
  const toggle = () => {
    if (!disabled && onChange) onChange(!checked);
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "checkbox",
    "aria-checked": checked,
    id: id,
    onClick: toggle,
    style: {
      width: 20,
      height: 20,
      borderRadius: 'var(--radius-xs)',
      flex: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: checked ? 'var(--brand-primary)' : 'var(--surface-card)',
      border: checked ? '1px solid var(--brand-primary)' : '1px solid var(--border-strong)',
      transition: 'background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)'
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-base)',
      color: 'var(--text-strong)',
      fontWeight: 500
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Doka IconButton — square, rounded action for toolbars and table rows.
 * Pass an icon element (e.g. a Lucide <svg>) as children.
 */
function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  'aria-label': ariaLabel,
  onClick,
  style,
  ...rest
}) {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 48
  };
  const dim = sizes[size] || 40;
  const variants = {
    ghost: {
      background: 'transparent',
      color: 'var(--text-body)'
    },
    soft: {
      background: 'var(--neutral-100)',
      color: 'var(--text-strong)'
    },
    primary: {
      background: 'var(--brand-primary)',
      color: '#fff'
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-strong)',
      border: '1px solid var(--border-default)'
    }
  };
  const v = variants[variant] || variants.ghost;
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const hoverBg = {
    ghost: 'var(--neutral-100)',
    soft: 'var(--neutral-150)',
    primary: 'var(--brand-primary-hover)',
    outline: 'var(--neutral-100)'
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": ariaLabel,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      width: dim,
      height: dim,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-md)',
      border: '1px solid transparent',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
      ...v,
      background: hover && !disabled ? hoverBg : v.background,
      transform: active && !disabled ? 'scale(var(--press-scale))' : 'none',
      opacity: disabled ? 0.45 : 1,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Doka Input — labelled text field with optional icon, hint and error state.
 */
function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  size = 'md',
  leftIcon,
  hint,
  error,
  disabled = false,
  fullWidth = true,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const sizes = {
    sm: {
      height: 'var(--control-h-sm)',
      font: 'var(--text-sm)'
    },
    md: {
      height: 'var(--control-h-md)',
      font: 'var(--text-base)'
    },
    lg: {
      height: 'var(--control-h-lg)',
      font: 'var(--text-md)'
    }
  };
  const s = sizes[size] || sizes.md;
  const borderColor = error ? 'var(--red-500)' : focus ? 'var(--brand-primary)' : 'var(--border-default)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: fullWidth ? '100%' : 'auto',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: 'block',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-strong)',
      marginBottom: 6
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: s.height,
      padding: '0 14px',
      background: disabled ? 'var(--neutral-100)' : 'var(--surface-card)',
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus && !error ? 'var(--ring)' : 'none',
      transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)'
    }
  }, leftIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      color: 'var(--text-muted)',
      flex: 'none'
    }
  }, leftIcon), /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
      fontSize: s.font,
      color: 'var(--text-strong)'
    }
  }, rest))), (hint || error) && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: error ? 'var(--red-600)' : 'var(--text-muted)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
/** Doka Select — compact dropdown. Options: [{value,label}] or strings. */
function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  size = 'md',
  disabled = false,
  fullWidth = true,
  id,
  style
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const norm = options.map(o => typeof o === 'string' ? {
    value: o,
    label: o
  } : o);
  const current = norm.find(o => o.value === value);
  const sizes = {
    sm: 'var(--control-h-sm)',
    md: 'var(--control-h-md)',
    lg: 'var(--control-h-lg)'
  };
  React.useEffect(() => {
    const h = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative',
      width: fullWidth ? '100%' : 'auto',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: 'block',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-strong)',
      marginBottom: 6
    }
  }, label), /*#__PURE__*/React.createElement("button", {
    id: id,
    type: "button",
    disabled: disabled,
    onClick: () => !disabled && setOpen(o => !o),
    style: {
      width: '100%',
      height: sizes[size] || sizes.md,
      padding: '0 12px 0 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      background: disabled ? 'var(--neutral-100)' : 'var(--surface-card)',
      border: `1px solid ${open ? 'var(--brand-primary)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-base)',
      fontWeight: 500,
      color: current ? 'var(--text-strong)' : 'var(--text-subtle)',
      boxShadow: open ? 'var(--ring)' : 'none',
      transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, current ? current.label : placeholder), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--text-muted)",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'transform var(--dur-fast)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  }))), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 6px)',
      left: 0,
      right: 0,
      zIndex: 30,
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      padding: 6,
      maxHeight: 260,
      overflowY: 'auto'
    }
  }, norm.map(o => {
    const sel = o.value === value;
    return /*#__PURE__*/React.createElement("div", {
      key: o.value,
      onClick: () => {
        onChange && onChange(o.value);
        setOpen(false);
      },
      style: {
        padding: '9px 10px',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-base)',
        fontWeight: sel ? 700 : 500,
        color: sel ? 'var(--orange-700)' : 'var(--text-body)',
        background: sel ? 'var(--orange-50)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      },
      onMouseEnter: e => {
        if (!sel) e.currentTarget.style.background = 'var(--neutral-100)';
      },
      onMouseLeave: e => {
        if (!sel) e.currentTarget.style.background = 'transparent';
      }
    }, o.label, sel && /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "var(--orange-600)",
      strokeWidth: "3",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20 6 9 17l-5-5"
    })));
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/** Doka Switch — toggle for settings & filters. Orange when on. */
function Switch({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  id,
  style
}) {
  const dims = size === 'sm' ? {
    w: 36,
    h: 20,
    k: 14
  } : {
    w: 44,
    h: 24,
    k: 18
  };
  const toggle = () => {
    if (!disabled && onChange) onChange(!checked);
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "switch",
    "aria-checked": checked,
    id: id,
    onClick: toggle,
    style: {
      width: dims.w,
      height: dims.h,
      borderRadius: 'var(--radius-pill)',
      flex: 'none',
      background: checked ? 'var(--brand-primary)' : 'var(--neutral-300)',
      position: 'relative',
      transition: 'background var(--dur-base) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: '50%',
      left: checked ? dims.w - dims.k - 3 : 3,
      transform: 'translateY(-50%)',
      width: dims.k,
      height: dims.k,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: 'var(--shadow-sm)',
      transition: 'left var(--dur-base) var(--ease-spring)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-base)',
      color: 'var(--text-strong)',
      fontWeight: 500
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/**
 * Doka Tabs — underline tab nav. `tabs`: [{key,label,count?}].
 * Controlled via `value` + `onChange`.
 */
function Tabs({
  tabs = [],
  value,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      borderBottom: '1px solid var(--border-subtle)',
      ...style
    }
  }, tabs.map(t => {
    const active = t.key === value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.key,
      type: "button",
      onClick: () => onChange && onChange(t.key),
      style: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '10px 14px 12px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: 'var(--text-base)',
        color: active ? 'var(--text-strong)' : 'var(--text-muted)',
        transition: 'color var(--dur-fast) var(--ease-standard)'
      },
      onMouseEnter: e => {
        if (!active) e.currentTarget.style.color = 'var(--text-body)';
      },
      onMouseLeave: e => {
        if (!active) e.currentTarget.style.color = 'var(--text-muted)';
      }
    }, t.label, t.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-xs)',
        fontWeight: 700,
        padding: '1px 7px',
        borderRadius: 'var(--radius-pill)',
        background: active ? 'var(--orange-50)' : 'var(--neutral-100)',
        color: active ? 'var(--orange-700)' : 'var(--text-muted)'
      }
    }, t.count), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 6,
        right: 6,
        bottom: -1,
        height: 3,
        borderRadius: '3px 3px 0 0',
        background: 'var(--brand-primary)',
        transform: active ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform var(--dur-base) var(--ease-spring)'
      }
    }));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/operations-dashboard/DashboardView.jsx
try { (() => {
/* Doka Operations Dashboard — main dashboard view. */
(function () {
  const {
    Card,
    StatCard,
    StatusPill,
    Badge,
    Button
  } = window.DokaDesignSystem_7dbee8;
  const Icon = window.Icon;
  const {
    shipments,
    volume
  } = window.DOKA_DATA;
  function VolumeChart() {
    const max = Math.max(...volume.map(d => d.v));
    const W = 520,
      H = 180,
      pad = 8;
    const bw = (W - pad * 2) / volume.length;
    return /*#__PURE__*/React.createElement("svg", {
      viewBox: `0 0 ${W} ${H + 28}`,
      style: {
        width: '100%',
        height: 'auto'
      }
    }, [0.25, 0.5, 0.75, 1].map((g, i) => /*#__PURE__*/React.createElement("line", {
      key: i,
      x1: 0,
      x2: W,
      y1: H - H * g,
      y2: H - H * g,
      stroke: "var(--neutral-150)",
      strokeWidth: "1"
    })), volume.map((d, i) => {
      const h = d.v / max * (H - 16);
      const x = pad + i * bw;
      const today = i === volume.length - 4;
      return /*#__PURE__*/React.createElement("g", {
        key: i
      }, /*#__PURE__*/React.createElement("rect", {
        x: x + bw * 0.18,
        y: H - h,
        width: bw * 0.64,
        height: h,
        rx: "6",
        fill: today ? 'var(--orange-500)' : 'var(--purple-200)'
      }), /*#__PURE__*/React.createElement("text", {
        x: x + bw / 2,
        y: H + 18,
        textAnchor: "middle",
        fontFamily: "var(--font-sans)",
        fontSize: "11",
        fontWeight: "600",
        fill: "var(--text-muted)"
      }, d.d));
    }));
  }
  function StatusBreakdown() {
    const rows = [{
      label: 'In transit',
      status: 'transit',
      pct: 38,
      count: 412
    }, {
      label: 'Out for delivery',
      status: 'out',
      pct: 22,
      count: 238
    }, {
      label: 'Delivered',
      status: 'delivered',
      pct: 32,
      count: 806
    }, {
      label: 'Delayed',
      status: 'delayed',
      pct: 6,
      count: 21
    }, {
      label: 'Exceptions',
      status: 'exception',
      pct: 2,
      count: 7
    }];
    const color = {
      transit: 'var(--status-transit)',
      out: 'var(--orange-500)',
      delivered: 'var(--status-delivered)',
      delayed: 'var(--status-delayed)',
      exception: 'var(--status-exception)'
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        height: 12,
        borderRadius: 'var(--radius-pill)',
        overflow: 'hidden',
        gap: 2
      }
    }, rows.map(r => /*#__PURE__*/React.createElement("div", {
      key: r.label,
      style: {
        width: r.pct + '%',
        background: color[r.status]
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, rows.map(r => /*#__PURE__*/React.createElement("div", {
      key: r.label,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color[r.status]
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: 'var(--font-sans)',
        fontSize: 13.5,
        fontWeight: 600,
        color: 'var(--text-body)'
      }
    }, r.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        color: 'var(--text-strong)',
        fontWeight: 600
      }
    }, r.count)))));
  }
  function SectionHead({
    title,
    action
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 17,
        color: 'var(--text-strong)'
      }
    }, title), action);
  }
  function DashboardView({
    onOpen
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "On-time rate",
      value: "96.4",
      unit: "%",
      delta: "2.1%",
      deltaDir: "up",
      tone: "success",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "clock"
      })
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Active shipments",
      value: "1,284",
      delta: "8%",
      deltaDir: "up",
      tone: "brand",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "package"
      })
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Out for delivery",
      value: "238",
      delta: "12%",
      deltaDir: "up",
      tone: "info",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "truck"
      })
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Avg. delay",
      value: "14",
      unit: "min",
      delta: "3%",
      deltaDir: "down",
      tone: "warning",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "alert"
      })
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: "lg"
    }, /*#__PURE__*/React.createElement(SectionHead, {
      title: "Daily shipment volume",
      action: /*#__PURE__*/React.createElement(Badge, {
        tone: "brand",
        soft: true
      }, "This week")
    }), /*#__PURE__*/React.createElement(VolumeChart, null)), /*#__PURE__*/React.createElement(Card, {
      padding: "lg"
    }, /*#__PURE__*/React.createElement(SectionHead, {
      title: "Status breakdown"
    }), /*#__PURE__*/React.createElement(StatusBreakdown, null))), /*#__PURE__*/React.createElement(Card, {
      padding: "lg"
    }, /*#__PURE__*/React.createElement(SectionHead, {
      title: "Recent shipments",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        size: "sm",
        rightIcon: /*#__PURE__*/React.createElement(Icon, {
          name: "arrowRight",
          size: 16
        }),
        onClick: () => onOpen && onOpen('shipments')
      }, "View all")
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column'
      }
    }, shipments.slice(0, 5).map((s, i) => /*#__PURE__*/React.createElement("div", {
      key: s.id,
      onClick: () => onOpen && onOpen('detail', s),
      style: {
        display: 'grid',
        gridTemplateColumns: '1.2fr 1.5fr 1fr auto',
        alignItems: 'center',
        gap: 16,
        padding: '12px 8px',
        borderTop: i === 0 ? 'none' : '1px solid var(--neutral-100)',
        cursor: 'pointer',
        borderRadius: 8
      },
      onMouseEnter: e => e.currentTarget.style.background = 'var(--neutral-50)',
      onMouseLeave: e => e.currentTarget.style.background = 'transparent'
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12.5,
        fontWeight: 600,
        color: 'var(--text-strong)'
      }
    }, s.id), s.priority && /*#__PURE__*/React.createElement(Badge, {
      tone: "purple"
    }, "Priority")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        color: 'var(--text-body)'
      }
    }, /*#__PURE__*/React.createElement("span", null, s.origin), /*#__PURE__*/React.createElement(Icon, {
      name: "arrowRight",
      size: 14,
      color: "var(--text-subtle)"
    }), /*#__PURE__*/React.createElement("span", null, s.dest)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        color: 'var(--text-muted)'
      }
    }, s.eta), /*#__PURE__*/React.createElement(StatusPill, {
      status: s.status,
      size: "sm"
    }))))));
  }
  window.DokaDashboardView = DashboardView;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/operations-dashboard/DashboardView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/operations-dashboard/Shell.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Doka Operations Dashboard — app shell (sidebar + topbar). */
(function () {
  const {
    Avatar,
    Badge,
    IconButton
  } = window.DokaDesignSystem_7dbee8;
  const Icon = window.Icon;
  function NavItem({
    icon,
    label,
    active,
    badge,
    onClick
  }) {
    const [hover, setHover] = React.useState(false);
    return /*#__PURE__*/React.createElement("button", {
      onClick: onClick,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: '10px 12px',
        border: 'none',
        cursor: 'pointer',
        borderRadius: 'var(--radius-md)',
        textAlign: 'left',
        fontFamily: 'var(--font-sans)',
        fontWeight: active ? 700 : 600,
        fontSize: 'var(--text-base)',
        color: active ? 'var(--orange-700)' : hover ? 'var(--text-strong)' : 'var(--text-body)',
        background: active ? 'var(--orange-50)' : hover ? 'var(--neutral-100)' : 'transparent',
        transition: 'background var(--dur-fast), color var(--dur-fast)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 19,
      color: active ? 'var(--orange-600)' : 'currentColor'
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, label), badge != null && /*#__PURE__*/React.createElement(Badge, {
      tone: active ? 'brand' : 'neutral'
    }, badge));
  }
  function Sidebar({
    view,
    setView
  }) {
    const nav = [{
      key: 'dashboard',
      icon: 'home',
      label: 'Dashboard'
    }, {
      key: 'shipments',
      icon: 'package',
      label: 'Shipments',
      badge: 1284
    }, {
      key: 'routes',
      icon: 'route',
      label: 'Routes'
    }, {
      key: 'fleet',
      icon: 'truck',
      label: 'Fleet'
    }, {
      key: 'hubs',
      icon: 'warehouse',
      label: 'Hubs'
    }, {
      key: 'team',
      icon: 'users',
      label: 'Team'
    }];
    return /*#__PURE__*/React.createElement("aside", {
      style: {
        width: 'var(--sidebar-w)',
        flex: 'none',
        height: '100%',
        background: 'var(--surface-card)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        padding: '6px 8px 18px'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/logos/doka-logo-full.png",
      height: "30",
      alt: "Doka"
    })), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }
    }, nav.map(n => /*#__PURE__*/React.createElement(NavItem, _extends({
      key: n.key
    }, n, {
      active: view === n.key,
      onClick: () => setView(n.key)
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }
    }, /*#__PURE__*/React.createElement(NavItem, {
      icon: "chart",
      label: "Reports"
    }), /*#__PURE__*/React.createElement(NavItem, {
      icon: "settings",
      label: "Settings"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        padding: 12,
        background: 'var(--purple-50)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        gap: 10,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: "Marina Alves",
      size: "sm",
      status: "online"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: 13,
        color: 'var(--text-strong)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, "Marina Alves"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 11,
        color: 'var(--text-muted)'
      }
    }, "Ops \xB7 CMNL")))));
  }
  function Topbar({
    title,
    subtitle,
    onSearch
  }) {
    return /*#__PURE__*/React.createElement("header", {
      style: {
        height: 'var(--topbar-h)',
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 24px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface-card)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 22,
        color: 'var(--text-strong)',
        lineHeight: 1.1
      }
    }, title), subtitle && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 12.5,
        color: 'var(--text-muted)'
      }
    }, subtitle)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 40,
        padding: '0 14px',
        width: 280,
        background: 'var(--neutral-100)',
        borderRadius: 'var(--radius-pill)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 17,
      color: "var(--text-muted)"
    }), /*#__PURE__*/React.createElement("input", {
      placeholder: "Search tracking code, customer\u2026",
      onChange: onSearch,
      style: {
        flex: 1,
        minWidth: 0,
        border: 'none',
        background: 'transparent',
        outline: 'none',
        fontFamily: 'var(--font-sans)',
        fontSize: 13.5,
        color: 'var(--text-strong)'
      }
    })), /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "Notifications",
      variant: "ghost"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "bell"
    })), /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "New shipment",
      variant: "primary"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus"
    })));
  }
  window.DokaShell = {
    Sidebar,
    Topbar
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/operations-dashboard/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/operations-dashboard/ShipmentDetail.jsx
try { (() => {
/* Doka Operations Dashboard — shipment detail slide-over. */
(function () {
  const {
    StatusPill,
    Badge,
    Button,
    ProgressTracker,
    Avatar,
    IconButton
  } = window.DokaDesignSystem_7dbee8;
  const Icon = window.Icon;
  function Field({
    label,
    value,
    mono
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)'
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text-strong)'
      }
    }, value));
  }
  function ShipmentDetail({
    shipment,
    onClose
  }) {
    if (!shipment) return null;
    const s = shipment;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 50
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: 'absolute',
        inset: 0,
        background: 'var(--scrim)',
        backdropFilter: 'var(--blur-sm)',
        WebkitBackdropFilter: 'var(--blur-sm)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 460,
        background: 'var(--surface-card)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'doka-slide 0.32s cubic-bezier(0.16,1,0.3,1)'
      }
    }, /*#__PURE__*/React.createElement("style", null, `@keyframes doka-slide{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}`), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px 22px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement(StatusPill, {
      status: s.status
    }), s.priority && /*#__PURE__*/React.createElement(Badge, {
      tone: "purple"
    }, "Priority")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 22,
        color: 'var(--text-strong)'
      }
    }, s.id), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        color: 'var(--text-muted)',
        marginTop: 2
      }
    }, s.customer)), /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "Close",
      variant: "ghost",
      onClick: onClose
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 22,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }
    }, /*#__PURE__*/React.createElement(ProgressTracker, {
      current: s.progress,
      steps: [{
        label: 'Picked up',
        sub: '09:12'
      }, {
        label: 'In transit',
        sub: '11:40'
      }, {
        label: 'Out',
        sub: '14:05'
      }, {
        label: 'Delivered'
      }]
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 18
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Origin",
      value: s.origin
    }), /*#__PURE__*/React.createElement(Field, {
      label: "Destination",
      value: s.dest
    }), /*#__PURE__*/React.createElement(Field, {
      label: "ETA",
      value: s.eta
    }), /*#__PURE__*/React.createElement(Field, {
      label: "Weight",
      value: s.weight,
      mono: true
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        background: 'var(--neutral-50)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: s.driver,
      status: "online"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: 14,
        color: 'var(--text-strong)'
      }
    }, s.driver), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        color: 'var(--text-muted)'
      }
    }, "Assigned driver")), /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "Call",
      variant: "soft"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "phone",
      size: 17
    })), /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "Locate",
      variant: "soft"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "pin",
      size: 17
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 150,
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(135deg, var(--purple-50), var(--orange-50))',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "map",
      size: 20,
      color: "var(--purple-400)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        fontWeight: 600
      }
    }, "Live map view"))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 'auto',
        padding: 18,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      fullWidth: true,
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "route",
        size: 16
      })
    }, "Reroute"), /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 16
      })
    }, "Mark delivered"))));
  }
  window.DokaShipmentDetail = ShipmentDetail;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/operations-dashboard/ShipmentDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/operations-dashboard/ShipmentsView.jsx
try { (() => {
/* Doka Operations Dashboard — shipments list view (tabs + table + filters). */
(function () {
  const {
    Card,
    Tabs,
    StatusPill,
    Badge,
    Tag,
    Button,
    Select,
    IconButton,
    Checkbox
  } = window.DokaDesignSystem_7dbee8;
  const Icon = window.Icon;
  const {
    shipments
  } = window.DOKA_DATA;
  function ShipmentsView({
    onOpen
  }) {
    const [tab, setTab] = React.useState('all');
    const [hub, setHub] = React.useState('all');
    const counts = {
      all: shipments.length,
      transit: shipments.filter(s => s.status === 'transit' || s.status === 'out').length,
      delivered: shipments.filter(s => s.status === 'delivered').length,
      issues: shipments.filter(s => s.status === 'delayed' || s.status === 'exception').length
    };
    const rows = shipments.filter(s => {
      if (tab === 'transit') return s.status === 'transit' || s.status === 'out';
      if (tab === 'delivered') return s.status === 'delivered';
      if (tab === 'issues') return s.status === 'delayed' || s.status === 'exception';
      return true;
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: "none"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 18px 0'
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      tabs: [{
        key: 'all',
        label: 'All',
        count: counts.all
      }, {
        key: 'transit',
        label: 'In transit',
        count: counts.transit
      }, {
        key: 'delivered',
        label: 'Delivered',
        count: counts.delivered
      }, {
        key: 'issues',
        label: 'Issues',
        count: counts.issues
      }]
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 18px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 180
      }
    }, /*#__PURE__*/React.createElement(Select, {
      value: hub,
      onChange: setHub,
      options: [{
        value: 'all',
        label: 'All hubs'
      }, {
        value: 'cwb',
        label: 'Curitiba · CWB'
      }, {
        value: 'gru',
        label: 'São Paulo · GRU'
      }],
      size: "sm"
    })), /*#__PURE__*/React.createElement(Tag, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "calendar",
        size: 14
      }),
      onRemove: () => {}
    }, "Today"), /*#__PURE__*/React.createElement(Tag, {
      onRemove: () => {}
    }, "Priority only"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "filter",
        size: 15
      })
    }, "Filters"), /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "download",
        size: 15
      })
    }, "Export")), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '32px 1.3fr 1.6fr 1.1fr 1fr 1fr 40px',
        gap: 14,
        padding: '11px 18px',
        background: 'var(--neutral-50)',
        fontFamily: 'var(--font-sans)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null, "Tracking"), /*#__PURE__*/React.createElement("span", null, "Route"), /*#__PURE__*/React.createElement("span", null, "Driver"), /*#__PURE__*/React.createElement("span", null, "ETA"), /*#__PURE__*/React.createElement("span", null, "Status"), /*#__PURE__*/React.createElement("span", null)), rows.map((s, i) => /*#__PURE__*/React.createElement("div", {
      key: s.id,
      onClick: () => onOpen && onOpen('detail', s),
      style: {
        display: 'grid',
        gridTemplateColumns: '32px 1.3fr 1.6fr 1.1fr 1fr 1fr 40px',
        gap: 14,
        alignItems: 'center',
        padding: '13px 18px',
        borderTop: i === 0 ? 'none' : '1px solid var(--neutral-100)',
        cursor: 'pointer'
      },
      onMouseEnter: e => e.currentTarget.style.background = 'var(--neutral-50)',
      onMouseLeave: e => e.currentTarget.style.background = 'transparent'
    }, /*#__PURE__*/React.createElement("span", {
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement(Checkbox, null)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12.5,
        fontWeight: 600,
        color: 'var(--text-strong)'
      }
    }, s.id), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 11.5,
        color: 'var(--text-muted)'
      }
    }, s.customer, s.priority ? ' · Priority' : '')), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        color: 'var(--text-body)'
      }
    }, /*#__PURE__*/React.createElement("span", null, s.origin), /*#__PURE__*/React.createElement(Icon, {
      name: "arrowRight",
      size: 13,
      color: "var(--text-subtle)"
    }), /*#__PURE__*/React.createElement("span", null, s.dest)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        color: 'var(--text-body)'
      }
    }, s.driver), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 12.5,
        color: 'var(--text-muted)'
      }
    }, s.eta), /*#__PURE__*/React.createElement(StatusPill, {
      status: s.status,
      size: "sm"
    }), /*#__PURE__*/React.createElement("span", {
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "More",
      variant: "ghost",
      size: "sm"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "more",
      size: 18
    }))))))));
  }
  window.DokaShipmentsView = ShipmentsView;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/operations-dashboard/ShipmentsView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/operations-dashboard/data.js
try { (() => {
/* Mock data for the Doka Operations Dashboard UI kit. */
window.DOKA_DATA = function () {
  const shipments = [{
    id: 'DK-8847-2291-BR',
    customer: 'Mercado Verde',
    origin: 'Curitiba · CWB',
    dest: 'São Paulo · GRU',
    status: 'transit',
    driver: 'Marina Alves',
    eta: 'Today 15:30',
    weight: '12.4 kg',
    priority: true,
    progress: 2
  }, {
    id: 'DK-8846-7714-BR',
    customer: 'TechNova Ltda',
    origin: 'Curitiba · CWB',
    dest: 'Joinville · JOI',
    status: 'out',
    driver: 'João Pedro',
    eta: 'Today 13:10',
    weight: '3.1 kg',
    priority: false,
    progress: 2
  }, {
    id: 'DK-8845-3398-BR',
    customer: 'Casa & Cia',
    origin: 'São Paulo · GRU',
    dest: 'Campinas · VCP',
    status: 'delivered',
    driver: 'Rafael Souza',
    eta: 'Delivered 11:42',
    weight: '8.0 kg',
    priority: false,
    progress: 3
  }, {
    id: 'DK-8844-1102-BR',
    customer: 'Farma Direta',
    origin: 'Belo Horizonte · CNF',
    dest: 'Uberlândia · UDI',
    status: 'delayed',
    driver: 'Beatriz Lima',
    eta: 'Delayed · +35 min',
    weight: '1.2 kg',
    priority: true,
    progress: 1
  }, {
    id: 'DK-8843-9920-BR',
    customer: 'Verde Hortifruti',
    origin: 'Curitiba · CWB',
    dest: 'Londrina · LDB',
    status: 'exception',
    driver: 'Carlos Dias',
    eta: 'Address issue',
    weight: '22.7 kg',
    priority: false,
    progress: 1
  }, {
    id: 'DK-8842-4471-BR',
    customer: 'Studio Marília',
    origin: 'São Paulo · GRU',
    dest: 'Santos · SSZ',
    status: 'transit',
    driver: 'Marina Alves',
    eta: 'Today 16:45',
    weight: '5.5 kg',
    priority: false,
    progress: 2
  }, {
    id: 'DK-8841-7783-BR',
    customer: 'Loja do Pedro',
    origin: 'Curitiba · CWB',
    dest: 'Curitiba · CWB',
    status: 'pending',
    driver: 'Unassigned',
    eta: 'Awaiting pickup',
    weight: '0.9 kg',
    priority: false,
    progress: 0
  }, {
    id: 'DK-8840-2266-BR',
    customer: 'Atacadão Sul',
    origin: 'Porto Alegre · POA',
    dest: 'Caxias · CXJ',
    status: 'delivered',
    driver: 'Rafael Souza',
    eta: 'Delivered 09:15',
    weight: '48.2 kg',
    priority: false,
    progress: 3
  }];
  const volume = [{
    d: 'Mon',
    v: 820
  }, {
    d: 'Tue',
    v: 932
  }, {
    d: 'Wed',
    v: 901
  }, {
    d: 'Thu',
    v: 1290
  }, {
    d: 'Fri',
    v: 1330
  }, {
    d: 'Sat',
    v: 1120
  }, {
    d: 'Sun',
    v: 690
  }];
  return {
    shipments,
    volume
  };
}();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/operations-dashboard/data.js", error: String((e && e.message) || e) }); }

// ui_kits/tracking-portal/TrackingPortal.jsx
try { (() => {
/* Doka Tracking Portal — public shipment tracking page. */
(function () {
  const {
    Button,
    Input,
    StatusPill,
    Badge,
    ProgressTracker,
    Avatar,
    Card
  } = window.DokaDesignSystem_7dbee8;
  const Icon = window.Icon;
  const TIMELINE = [{
    time: '14:05',
    date: 'Jun 16',
    title: 'Out for delivery',
    place: 'São Paulo · GRU hub',
    active: true
  }, {
    time: '11:40',
    date: 'Jun 16',
    title: 'Arrived at destination hub',
    place: 'São Paulo · GRU hub'
  }, {
    time: '06:18',
    date: 'Jun 16',
    title: 'In transit',
    place: 'BR-116 · en route'
  }, {
    time: '21:50',
    date: 'Jun 15',
    title: 'Departed origin hub',
    place: 'Curitiba · CWB hub'
  }, {
    time: '17:32',
    date: 'Jun 15',
    title: 'Picked up',
    place: 'Curitiba · CWB'
  }];
  function Result() {
    return /*#__PURE__*/React.createElement(Card, {
      padding: "none",
      style: {
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--purple-600)',
        padding: '22px 26px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 48,
        height: 48,
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255,255,255,0.14)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "package",
      size: 24,
      color: "#fff"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: '0.02em'
      }
    }, "DK-8847-2291-BR"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        color: 'rgba(255,255,255,0.75)',
        marginTop: 2
      }
    }, "Mercado Verde \xB7 1 package \xB7 12.4 kg")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right'
      }
    }, /*#__PURE__*/React.createElement(StatusPill, {
      status: "out"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 20,
        marginTop: 8
      }
    }, "Arrives today"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 12.5,
        color: 'rgba(255,255,255,0.75)'
      }
    }, "Estimated 15:30\u201316:00"))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '28px 26px'
      }
    }, /*#__PURE__*/React.createElement(ProgressTracker, {
      current: 2,
      steps: [{
        label: 'Picked up',
        sub: 'Jun 15'
      }, {
        label: 'In transit',
        sub: 'Jun 16'
      }, {
        label: 'Out for delivery',
        sub: '14:05'
      }, {
        label: 'Delivered',
        sub: '~15:30'
      }]
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: 0,
        borderTop: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '22px 26px'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 16,
        marginBottom: 18,
        color: 'var(--text-strong)'
      }
    }, "Tracking history"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column'
      }
    }, TIMELINE.map((e, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: e.active ? 'var(--orange-500)' : 'var(--neutral-300)',
        border: e.active ? '3px solid var(--orange-100)' : 'none',
        marginTop: 4,
        flex: 'none'
      }
    }), i < TIMELINE.length - 1 && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 2,
        flex: 1,
        background: 'var(--neutral-200)',
        margin: '2px 0'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingBottom: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: 14,
        color: e.active ? 'var(--orange-700)' : 'var(--text-strong)'
      }
    }, e.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 12.5,
        color: 'var(--text-muted)'
      }
    }, e.place), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11.5,
        color: 'var(--text-subtle)',
        marginTop: 2
      }
    }, e.date, " \xB7 ", e.time)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '22px 26px',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 150,
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(135deg, var(--purple-50), var(--orange-50))',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: 'var(--purple-400)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "map",
      size: 20
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        fontWeight: 600
      }
    }, "Live map")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: "Jo\xE3o Pedro",
      status: "online"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: 14,
        color: 'var(--text-strong)'
      }
    }, "Jo\xE3o Pedro"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        color: 'var(--text-muted)'
      }
    }, "Your driver \xB7 4.9 \u2605")), /*#__PURE__*/React.createElement(Badge, {
      tone: "success",
      dot: true
    }, "Nearby")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(DetailRow, {
      label: "Recipient",
      value: "Ana Ribeiro"
    }), /*#__PURE__*/React.createElement(DetailRow, {
      label: "Address",
      value: "R. Augusta 1200, SP"
    }), /*#__PURE__*/React.createElement(DetailRow, {
      label: "Service",
      value: "Express \xB7 Signature"
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      fullWidth: true,
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "bell",
        size: 16
      })
    }, "Notify me on delivery"))));
  }
  function DetailRow({
    label,
    value
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        paddingBottom: 8,
        borderBottom: '1px solid var(--neutral-100)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        color: 'var(--text-muted)'
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text-strong)',
        textAlign: 'right'
      }
    }, value));
  }
  function TrackingPortal() {
    const [code, setCode] = React.useState('DK-8847-2291-BR');
    const [tracked, setTracked] = React.useState(true);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("header", {
      style: {
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface-card)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/logos/doka-logo-full.png",
      height: "30",
      alt: "Doka"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: 'flex',
        gap: 26,
        alignItems: 'center',
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: 14,
        color: 'var(--text-body)'
      }
    }, /*#__PURE__*/React.createElement("span", null, "Track"), /*#__PURE__*/React.createElement("span", null, "Send"), /*#__PURE__*/React.createElement("span", null, "Business"), /*#__PURE__*/React.createElement("span", null, "Support"), /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm"
    }, "Sign in"))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(180deg, var(--orange-50), var(--surface-page))',
        padding: '48px 32px 36px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 720,
        margin: '0 auto',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "brand",
      soft: true
    }, "Real-time tracking"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 44,
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
        color: 'var(--text-strong)',
        marginTop: 14
      }
    }, "Where's my package?"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 16,
        color: 'var(--text-muted)',
        marginTop: 10
      }
    }, "Enter your Doka tracking code to follow every step."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        maxWidth: 520,
        margin: '24px auto 0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(Input, {
      value: code,
      onChange: e => setCode(e.target.value),
      placeholder: "DK-0000-0000-BR",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "search",
        size: 18
      }),
      size: "lg"
    })), /*#__PURE__*/React.createElement(Button, {
      size: "lg",
      onClick: () => setTracked(true),
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "truck",
        size: 18
      })
    }, "Track")))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        padding: '0 32px 48px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 920,
        margin: '-12px auto 0'
      }
    }, tracked && /*#__PURE__*/React.createElement(Result, null))));
  }
  window.DokaTrackingPortal = TrackingPortal;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tracking-portal/TrackingPortal.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.ProgressTracker = __ds_scope.ProgressTracker;

__ds_ns.StatusPill = __ds_scope.StatusPill;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
