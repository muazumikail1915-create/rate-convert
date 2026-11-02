import React from "react";

interface FlagProps {
  code: string;
  className?: string;
  size?: number;
}

export const CountryFlag: React.FC<FlagProps> = ({ code, className = "", size = 24 }) => {
  const c = code.toUpperCase();

  switch (c) {
    case "NG":
    case "NGN":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <g fillRule="evenodd">
            <path fill="#008751" d="M0 0h640v480H0z" />
            <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
          </g>
        </svg>
      );
    case "US":
    case "USD":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <g fillRule="evenodd">
            <path fill="#bd3d44" d="M0 0h640v480H0z" />
            <path stroke="#fff" strokeWidth="37" d="M0 55.4h640M0 129.2h640M0 203h640M0 277h640M0 350.8h640M0 424.6h640" />
            <path fill="#192f5d" d="M0 0h280v258.5H0z" />
            <g fill="#fff">
              <circle cx="35" cy="30" r="10" />
              <circle cx="105" cy="30" r="10" />
              <circle cx="175" cy="30" r="10" />
              <circle cx="245" cy="30" r="10" />
              <circle cx="70" cy="65" r="10" />
              <circle cx="140" cy="65" r="10" />
              <circle cx="210" cy="65" r="10" />
              <circle cx="35" cy="100" r="10" />
              <circle cx="105" cy="100" r="10" />
              <circle cx="175" cy="100" r="10" />
              <circle cx="245" cy="100" r="10" />
              <circle cx="70" cy="135" r="10" />
              <circle cx="140" cy="135" r="10" />
              <circle cx="210" cy="135" r="10" />
              <circle cx="35" cy="170" r="10" />
              <circle cx="105" cy="170" r="10" />
              <circle cx="175" cy="170" r="10" />
              <circle cx="245" cy="170" r="10" />
              <circle cx="70" cy="205" r="10" />
              <circle cx="140" cy="205" r="10" />
              <circle cx="210" cy="205" r="10" />
            </g>
          </g>
        </svg>
      );
    case "GB":
    case "GBP":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#012169" d="M0 0h640v480H0z" />
          <path fill="#fff" d="m75 0 245 180L565 0h75v45L435 240l205 155v45h-75L320 260 75 440H0v-45l205-155L0 45V0h75z" />
          <path fill="#c8102e" d="m0 0 250 185h-45L0 35V0zm390 185L640 0v35L435 185h-45zM0 445l205-155h45L0 480v-35zm640 0L435 290h45l160 120v35z" />
          <path fill="#fff" d="M260 0h120v480H260zM0 180h640v120H0z" />
          <path fill="#c8102e" d="M280 0h80v480h-80zM0 200h640v80H0z" />
        </svg>
      );
    case "EU":
    case "EUR":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#003399" d="M0 0h640v480H0z" />
          <g fill="#ffcc00" transform="translate(320 240)">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              const x = Math.sin(rad) * 110;
              const y = -Math.cos(rad) * 110;
              return <circle key={idx} cx={x} cy={y} r="10" />;
            })}
          </g>
        </svg>
      );
    case "CA":
    case "CAD":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#f00" d="M0 0h640v480H0z" />
          <path fill="#fff" d="M160 0h320v480H160z" />
          <path
            fill="#f00"
            d="m320 100 20 40 45-10-25 45 40 10-40 30 15 45-45-20-10 60h-10l-10-60-45 20 15-45-40-30 40-10-25-45 45 10 20-40z"
          />
        </svg>
      );
    case "AU":
    case "AUD":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#00008b" d="M0 0h640v480H0z" />
          <path fill="#fff" d="m37.5 0 122.5 90L282.5 0h37.5v22.5L217.5 120l102.5 77.5V220h-37.5L160 130 37.5 220H0v-22.5L102.5 120 0 22.5V0h37.5z" />
          <path fill="#f00" d="m0 0 125 92.5h-22.5L0 17.5V0zm195 92.5L320 0v17.5L217.5 92.5h-22.5zM0 222.5l102.5-77.5h22.5L0 240v-17.5zm320 0-102.5-77.5h22.5l80 60v17.5z" />
          <path fill="#fff" d="M130 0h60v240h-60zM0 90h320v60H0z" />
          <path fill="#f00" d="M140 0h40v240h-40zM0 100h320v40H0z" />
          <circle cx="480" cy="120" r="14" fill="#fff" />
          <circle cx="560" cy="200" r="14" fill="#fff" />
          <circle cx="480" cy="340" r="14" fill="#fff" />
          <circle cx="420" cy="220" r="14" fill="#fff" />
          <circle cx="160" cy="360" r="28" fill="#fff" />
        </svg>
      );
    case "CH":
    case "CHF":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#d52b1e" d="M0 0h640v480H0z" />
          <path fill="#fff" d="M260 100h120v280H260zM160 200h320v80H160z" />
        </svg>
      );
    case "JP":
    case "JPY":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#fff" d="M0 0h640v480H0z" />
          <circle cx="320" cy="240" r="140" fill="#bc002d" />
        </svg>
      );
    case "CN":
    case "CNY":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#de2910" d="M0 0h640v480H0z" />
          <g fill="#ffde00">
            <circle cx="100" cy="100" r="30" />
            <circle cx="170" cy="50" r="10" />
            <circle cx="210" cy="80" r="10" />
            <circle cx="210" cy="130" r="10" />
            <circle cx="170" cy="165" r="10" />
          </g>
        </svg>
      );
    case "SG":
    case "SGD":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#ed2939" d="M0 0h640v240H0z" />
          <path fill="#fff" d="M0 240h640v240H0z" />
          <circle cx="120" cy="120" r="65" fill="#fff" />
          <circle cx="145" cy="120" r="60" fill="#ed2939" />
        </svg>
      );
    case "GH":
    case "GHS":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#006b3f" d="M0 0h640v480H0z" />
          <path fill="#fcd116" d="M0 0h640v320H0z" />
          <path fill="#ce1126" d="M0 0h640v160H0z" />
          <polygon fill="#000" points="320,180 338,236 397,236 349,271 367,327 320,292 273,327 291,271 243,236 302,236" />
        </svg>
      );
    case "ZA":
    case "ZAR":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#002395" d="M0 240h640v240H0z" />
          <path fill="#de3831" d="M0 0h640v240H0z" />
          <path fill="#ffb612" d="M0 0h160l240 240-240 240H0z" />
          <path fill="#000" d="M0 40h120l200 200-200 200H0z" />
          <path fill="#fff" d="M160 0h80l240 200h160v80H480L240 480h-80l240-200H160z" />
          <path fill="#007a4d" d="M190 0h50l240 190h160v100H480L240 480h-50l240-200H0v-80h430z" />
        </svg>
      );
    case "KE":
    case "KES":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#006600" d="M0 320h640v160H0z" />
          <path fill="#bb0000" d="M0 160h640v160H0z" />
          <path fill="#000" d="M0 0h640v160H0z" />
          <path fill="#fff" d="M0 145h640v30H0zm0 160h640v30H0z" />
          <ellipse cx="320" cy="240" rx="60" ry="100" fill="#bb0000" stroke="#fff" strokeWidth="8" />
        </svg>
      );
    case "EG":
    case "EGP":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#000" d="M0 320h640v160H0z" />
          <path fill="#fff" d="M0 160h640v160H0z" />
          <path fill="#c8102e" d="M0 0h640v160H0z" />
          <circle cx="320" cy="240" r="24" fill="#c09300" />
        </svg>
      );
    case "SN":
    case "XOF":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#00853f" d="M0 0h213.3v480H0z" />
          <path fill="#fdef42" d="M213.3 0h213.4v480H213.3z" />
          <path fill="#e31b23" d="M426.7 0H640v480H426.7z" />
          <polygon fill="#00853f" points="320,190 335,236 384,236 344,265 359,311 320,282 281,311 296,265 256,236 305,236" />
        </svg>
      );
    case "CM":
    case "XAF":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#007a5e" d="M0 0h213.3v480H0z" />
          <path fill="#ce1126" d="M213.3 0h213.4v480H213.3z" />
          <path fill="#fcd116" d="M426.7 0H640v480H426.7z" />
          <polygon fill="#fcd116" points="320,200 333,240 375,240 341,265 354,305 320,280 286,305 299,265 265,240 307,240" />
        </svg>
      );
    case "RW":
    case "RWF":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#00a3e0" d="M0 0h640v240H0z" />
          <path fill="#fad201" d="M0 240h640v120H0z" />
          <path fill="#20603d" d="M0 360h640v120H0z" />
          <circle cx="530" cy="110" r="30" fill="#fad201" />
        </svg>
      );
    case "TZ":
    case "TZS":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#1eb53a" d="M0 0h640v480H0z" />
          <path fill="#00a3dd" d="M0 480l640-480v480H0z" />
          <path fill="#000" stroke="#fcd116" strokeWidth="40" d="M0 480L640 0" />
        </svg>
      );
    case "UG":
    case "UGX":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#000" d="M0 0h640v80H0zM0 240h640v80H0z" />
          <path fill="#fcd116" d="M0 80h640v80H0zM0 320h640v80H0z" />
          <path fill="#d90000" d="M0 160h640v80H0zM0 400h640v80H0z" />
          <circle cx="320" cy="240" r="45" fill="#fff" />
        </svg>
      );
    case "MA":
    case "MAD":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#c1272d" d="M0 0h640v480H0z" />
          <polygon
            fill="none"
            stroke="#006233"
            strokeWidth="14"
            points="320,150 345,225 425,225 360,270 385,345 320,300 255,345 280,270 215,225 295,225"
          />
        </svg>
      );
    case "ET":
    case "ETB":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#078930" d="M0 0h640v160H0z" />
          <path fill="#fcdd09" d="M0 160h640v160H0z" />
          <path fill="#da121a" d="M0 320h640v160H0z" />
          <circle cx="320" cy="240" r="50" fill="#0f47af" />
          <polygon fill="#fcdd09" points="320,205 330,230 355,230 335,245 342,270 320,255 298,270 305,245 285,230 310,230" />
        </svg>
      );
    case "AE":
    case "AED":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#00732f" d="M0 0h640v160H0z" />
          <path fill="#fff" d="M0 160h640v160H0z" />
          <path fill="#000" d="M0 320h640v160H0z" />
          <path fill="#f00" d="M0 0h180v480H0z" />
        </svg>
      );
    case "IN":
    case "INR":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#ff9933" d="M0 0h640v160H0z" />
          <path fill="#fff" d="M0 160h640v160H0z" />
          <path fill="#128807" d="M0 320h640v160H0z" />
          <circle cx="320" cy="240" r="35" fill="none" stroke="#000080" strokeWidth="6" />
        </svg>
      );
    case "BR":
    case "BRL":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#009b3a" d="M0 0h640v480H0z" />
          <polygon fill="#fedf00" points="320,50 590,240 320,430 50,240" />
          <circle cx="320" cy="240" r="85" fill="#002776" />
        </svg>
      );
    case "SA":
    case "SAR":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#006c35" d="M0 0h640v480H0z" />
          <path fill="#fff" d="M220 280h200v15H220zM250 260l-30 20 30 20z" />
        </svg>
      );
    case "TR":
    case "TRY":
      return (
        <svg
          width={size}
          height={(size * 3) / 4}
          viewBox="0 0 640 480"
          className={`rounded-[3px] shadow-sm inline-block shrink-0 ${className}`}
        >
          <path fill="#e30a17" d="M0 0h640v480H0z" />
          <circle cx="280" cy="240" r="100" fill="#fff" />
          <circle cx="305" cy="240" r="80" fill="#e30a17" />
          <polygon fill="#fff" points="390,240 370,225 375,250 355,235 378,215" />
        </svg>
      );
    default:
      return (
        <div
          style={{ width: size, height: (size * 3) / 4 }}
          className={`bg-slate-700 text-slate-300 rounded-[3px] flex items-center justify-center text-[10px] font-bold ${className}`}
        >
          {c.slice(0, 2)}
        </div>
      );
  }
};
