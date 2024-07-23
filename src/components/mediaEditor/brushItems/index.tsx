import {createEffect, createSignal, For, JSXElement} from 'solid-js';
import {i18n, LangPackKey} from '../../../lib/langPack';
import classNames from '../../../helpers/string/classNames';
import IS_CANVAS_FILTER_SUPPORTED from '../../../environment/canvasFilterSupport';
import boxBlurCanvasRGB from '../../../vendor/fastBlur';
import {hexToRgb} from '../../../helpers/color';

export interface BrashProps {
  color?: string
}

export const Pen = ({color = '#FE4438'}: BrashProps) => {
  return (
    <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_7897_488)">
        <g filter="url(#filter0_iiii_7897_488)">
          <path
            d="M0 1H80L110.2 8.44653C112.048 8.90213 112.971 9.12994 113.185 9.49307C113.369 9.80597 113.369 10.194 113.185 10.5069C112.971 10.8701 112.048 11.0979 110.2 11.5535L80 19H0V1Z"
            fill="#3E3F3F"/>
        </g>
        <path
          d="M112.564 10.9709L103.474 13.2132C103.21 13.2782 102.944 13.121 102.883 12.8566C102.736 12.2146 102.5 11.0296 102.5 10C102.5 8.9705 102.736 7.78549 102.883 7.14344C102.944 6.87906 103.21 6.72187 103.474 6.78685L112.564 9.02913C113.578 9.27925 113.578 10.7208 112.564 10.9709Z"
          fill={color}/>
        <rect x="76" y="1" width="4" height="18" rx="0.5" fill={color}/>
      </g>
      <defs>
        <filter id="filter0_iiii_7897_488" x="0" y="-4" width="116.323" height="28" filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="1" dy="5"/>
          <feGaussianBlur stdDeviation="3"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_7897_488"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="3" dy="-5"/>
          <feGaussianBlur stdDeviation="3"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
          <feBlend mode="normal" in2="effect1_innerShadow_7897_488" result="effect2_innerShadow_7897_488"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="1" dy="-1"/>
          <feGaussianBlur stdDeviation="0.5"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
          <feBlend mode="normal" in2="effect2_innerShadow_7897_488" result="effect3_innerShadow_7897_488"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="1" dy="1"/>
          <feGaussianBlur stdDeviation="0.5"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
          <feBlend mode="normal" in2="effect3_innerShadow_7897_488" result="effect4_innerShadow_7897_488"/>
        </filter>
        <clipPath id="clip0_7897_488">
          <rect width="20" height="120" fill="white" transform="matrix(0 1 -1 0 120 0)"/>
        </clipPath>
      </defs>
    </svg>
  )
}

export const Arrow = ({color = '#FFD60A'}: BrashProps) => {
  return (
    <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_1_231)">
        <path d="M94 10H110M110 10L104 4M110 10L104 16" stroke="url(#paint0_linear_1_231)" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round"/>
        <g filter="url(#filter0_iiii_1_231)">
          <path d="M0 1H92C94.2091 1 96 2.79086 96 5V15C96 17.2091 94.2091 19 92 19H0V1Z" fill="#3E3F3F"/>
        </g>
        <path d="M92 1C94.2091 1 96 2.79086 96 5V15C96 17.2091 94.2091 19 92 19V1Z" fill={color}/>
      </g>
      <defs>
        <filter id="filter0_iiii_1_231" x="0" y="-4" width="99" height="28" filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="1" dy="5"/>
          <feGaussianBlur stdDeviation="3"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_231"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="3" dy="-5"/>
          <feGaussianBlur stdDeviation="3"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
          <feBlend mode="normal" in2="effect1_innerShadow_1_231" result="effect2_innerShadow_1_231"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="1" dy="-1"/>
          <feGaussianBlur stdDeviation="0.5"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
          <feBlend mode="normal" in2="effect2_innerShadow_1_231" result="effect3_innerShadow_1_231"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="1" dy="1"/>
          <feGaussianBlur stdDeviation="0.5"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
          <feBlend mode="normal" in2="effect3_innerShadow_1_231" result="effect4_innerShadow_1_231"/>
        </filter>
        <linearGradient id="paint0_linear_1_231" x1="110" y1="10" x2="94" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0.755" stop-color={color}/>
          <stop offset="1" stop-color={color} stop-opacity="0"/>
        </linearGradient>
        <clipPath id="clip0_1_231">
          <rect width="20" height="120" fill={color} transform="matrix(0 1 -1 0 120 0)"/>
        </clipPath>
      </defs>
    </svg>
  )
}

export const Brush = ({color = '#FF8901'}: BrashProps) => {
  return (
    <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_1_265)">
        <g filter="url(#filter0_iiii_1_265)">
          <path
            d="M0 1H82.3579C83.4414 1 84.5135 1.22006 85.5093 1.64684L91 4H101C101.552 4 102 4.44772 102 5V15C102 15.5523 101.552 16 101 16H91L85.5093 18.3532C84.5135 18.7799 83.4414 19 82.3579 19H0V1Z"
            fill="#3E3F3F"/>
        </g>
        <rect x="76" y="1" width="4" height="18" rx="0.5" fill={color}/>
        <path
          d="M102 5H106.434C106.785 5 107.111 5.1843 107.291 5.4855L112.091 13.4855C112.491 14.152 112.011 15 111.234 15H102V5Z"
          fill={color}/>
      </g>
      <defs>
        <filter id="filter0_iiii_1_265" x="0" y="-4" width="105" height="28" filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="1" dy="5"/>
          <feGaussianBlur stdDeviation="3"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_265"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="3" dy="-5"/>
          <feGaussianBlur stdDeviation="3"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
          <feBlend mode="normal" in2="effect1_innerShadow_1_265" result="effect2_innerShadow_1_265"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="1" dy="-1"/>
          <feGaussianBlur stdDeviation="0.5"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
          <feBlend mode="normal" in2="effect2_innerShadow_1_265" result="effect3_innerShadow_1_265"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="1" dy="1"/>
          <feGaussianBlur stdDeviation="0.5"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
          <feBlend mode="normal" in2="effect3_innerShadow_1_265" result="effect4_innerShadow_1_265"/>
        </filter>
        <clipPath id="clip0_1_265">
          <rect width="20" height="120" fill={color} transform="matrix(0 1 -1 0 120 0)"/>
        </clipPath>
      </defs>
    </svg>
  )
}

export const Neon = ({color = '#62E5E0'}: BrashProps) => {
  return (
    <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_1_271)">
        <g filter="url(#filter0_f_1_271)">
          <path
            d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z"
            fill={color}/>
        </g>
        <g filter="url(#filter1_f_1_271)">
          <path
            d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z"
            fill={color}/>
        </g>
        <g filter="url(#filter2_f_1_271)">
          <path
            d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z"
            fill={color}/>
        </g>
        <g filter="url(#filter3_iiii_1_271)">
          <path
            d="M0 1H82.3579C83.4414 1 84.5135 1.22006 85.5093 1.64684L91 4H101C101.552 4 102 4.44772 102 5V15C102 15.5523 101.552 16 101 16H91L85.5093 18.3532C84.5135 18.7799 83.4414 19 82.3579 19H0V1Z"
            fill="#3E3F3F"/>
        </g>
        <rect x="76" y="1" width="4" height="18" rx="0.5" fill={color}/>
        <path
          d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z"
          fill={color}/>
      </g>
      <defs>
        <filter id="filter0_f_1_271" x="96" y="-1" width="20" height="22" filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="3" result="effect1_foregroundBlur_1_271"/>
        </filter>
        <filter id="filter1_f_1_271" x="96" y="-1" width="20" height="22" filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="3" result="effect1_foregroundBlur_1_271"/>
        </filter>
        <filter id="filter2_f_1_271" x="96" y="-1" width="20" height="22" filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="3" result="effect1_foregroundBlur_1_271"/>
        </filter>
        <filter id="filter3_iiii_1_271" x="0" y="-4" width="105" height="28" filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="1" dy="5"/>
          <feGaussianBlur stdDeviation="3"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_271"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="3" dy="-5"/>
          <feGaussianBlur stdDeviation="3"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
          <feBlend mode="normal" in2="effect1_innerShadow_1_271" result="effect2_innerShadow_1_271"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="1" dy="-1"/>
          <feGaussianBlur stdDeviation="0.5"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
          <feBlend mode="normal" in2="effect2_innerShadow_1_271" result="effect3_innerShadow_1_271"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="1" dy="1"/>
          <feGaussianBlur stdDeviation="0.5"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
          <feBlend mode="normal" in2="effect3_innerShadow_1_271" result="effect4_innerShadow_1_271"/>
        </filter>
        <clipPath id="clip0_1_271">
          <rect width="20" height="120" fill={color} transform="matrix(0 1 -1 0 120 0)"/>
        </clipPath>
      </defs>
    </svg>
  )
}

export const Blur = () => {
  return (
    <img
      width="120"
      height="25"
      src='/assets/img/blur_brush.png'
    />
  )
}

export const Eraser = () => {
  return (
    <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_1_240)">
        <g filter="url(#filter0_i_1_240)">
          <path d="M95 1H108C110.209 1 112 2.79086 112 5V15C112 17.2091 110.209 19 108 19H95V1Z" fill="#D9D9D9"/>
          <path d="M95 1H108C110.209 1 112 2.79086 112 5V15C112 17.2091 110.209 19 108 19H95V1Z" fill="#F09B99"/>
        </g>
        <g filter="url(#filter1_iiii_1_240)">
          <path
            d="M0 1H77.6464C77.8728 1 78.0899 0.910072 78.25 0.75C78.4101 0.589928 78.6272 0.5 78.8536 0.5H96C97.1046 0.5 98 1.39543 98 2.5V17.5C98 18.6046 97.1046 19.5 96 19.5H78.8536C78.6272 19.5 78.4101 19.4101 78.25 19.25C78.0899 19.0899 77.8728 19 77.6464 19H0V1Z"
            fill="#3E3F3F"/>
        </g>
        <path d="M79 19.5V0.5L78 0.5V19.5H79Z" fill="black" fill-opacity="0.33"/>
      </g>
      <defs>
        <filter id="filter0_i_1_240" x="95" y="-1" width="19" height="20" filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="2" dy="-2"/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.33 0"/>
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_240"/>
        </filter>
        <filter id="filter1_iiii_1_240" x="0" y="-4.5" width="101" height="29" filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="1" dy="5"/>
          <feGaussianBlur stdDeviation="3"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_240"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="3" dy="-5"/>
          <feGaussianBlur stdDeviation="3"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
          <feBlend mode="normal" in2="effect1_innerShadow_1_240" result="effect2_innerShadow_1_240"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="1" dy="-1"/>
          <feGaussianBlur stdDeviation="0.5"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
          <feBlend mode="normal" in2="effect2_innerShadow_1_240" result="effect3_innerShadow_1_240"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"/>
          <feOffset dx="1" dy="1"/>
          <feGaussianBlur stdDeviation="0.5"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
          <feBlend mode="normal" in2="effect3_innerShadow_1_240" result="effect4_innerShadow_1_240"/>
        </filter>
        <clipPath id="clip0_1_240">
          <rect width="20" height="120" fill="white" transform="matrix(0 1 -1 0 120 0)"/>
        </clipPath>
      </defs>
    </svg>
  )
}

export interface PaintingInfo {
  color: string,
  size: number
}

export class PaintingLayer {
  protected context2d: CanvasRenderingContext2D;
  public canvas: HTMLCanvasElement;
  public renderedElement: HTMLImageElement | HTMLCanvasElement;
  protected isDrawing = false;
  protected color: string = '#2478d5';
  protected size: number = 42;

  public attach({
    renderedElement,
    canvas
  }: {
    renderedElement?: HTMLImageElement | HTMLCanvasElement,
    canvas?: HTMLCanvasElement
  }) {
    this.renderedElement = renderedElement;
    this.canvas = canvas;

    this.canvas.onmousedown = this.onTouchStart.bind(this);
    this.canvas.onmouseup = this.onTouchEnd.bind(this);
    this.canvas.onmouseleave = this.onTouchEnd.bind(this);
    this.canvas.onmousemove = this.draw.bind(this);
    this.context2d = this.canvas.getContext('2d');
  }

  public detach() {
    this.canvas.onmousedown = null;
    this.canvas.onmouseup = null;
    this.canvas.onmouseleave = null;
    this.canvas.onmousemove = null;
    this.context2d.shadowColor = null;
    this.context2d.strokeStyle = null;
    this.context2d.lineCap = null;
    this.context2d.filter = null;
    this.context2d.lineWidth = null;
    this.context2d.shadowBlur = null;
    this.context2d.shadowColor = null;
    this.context2d.strokeStyle = null;
    this.context2d.lineJoin = null;
  }

  public setPaintingInfo({
    color,
    size
  }: PaintingInfo) {
    this.color = color;
    this.size = size;
  }

  protected getRealSizePerRendererSize() {
    const bcr = this.canvas.getBoundingClientRect();

    return this.canvas.width / bcr.width;
  }

  protected draw<EventListener>(event: MouseEvent) {
    if(!this.isDrawing) {
      return;
    }

    const bcr = (event.target as HTMLElement).getBoundingClientRect();
    const relativeX = (event.clientX - bcr.left) * this.getRealSizePerRendererSize();
    const relativeY = (event.clientY - bcr.top) * this.getRealSizePerRendererSize();

    this.context2d.lineWidth = this.size * this.getRealSizePerRendererSize();
    this.context2d.strokeStyle = this.color;
    this.context2d.lineCap = 'round';
    this.context2d.lineTo(relativeX, relativeY);
    this.context2d.stroke();
    this.context2d.beginPath();
    this.context2d.moveTo(relativeX, relativeY);
  }

  protected onTouchStart() {
    this.isDrawing = true;
  }

  protected onTouchEnd() {
    this.isDrawing = false;
    this.context2d.beginPath();
  }
}

export class PaintingLayerBrush extends PaintingLayer {
  hasBeginPath = false;
  brushCanvas: HTMLCanvasElement;
  brushContext2d: CanvasRenderingContext2D;
  lastX: number;
  lastY: number;
  memorizedDots: any = {};

  override attach({
    renderedElement,
    canvas
  }: {
    renderedElement?: HTMLImageElement | HTMLCanvasElement,
    canvas?: HTMLCanvasElement
  }) {
    super.attach({renderedElement, canvas});
    this.context2d = this.canvas.getContext('2d');
    this.brushCanvas = document.createElement('canvas');
    this.brushCanvas.width = this.canvas.width;
    this.brushCanvas.height = this.canvas.height;
    this.brushContext2d = this.brushCanvas.getContext('2d');
  }

  protected draw<EventListener>(event: MouseEvent) {
    if(!this.isDrawing) {
      return;
    }

    const bcr = (event.target as HTMLElement).getBoundingClientRect();
    const x = (event.clientX - bcr.left) * this.getRealSizePerRendererSize();
    const y = (event.clientY - bcr.top) * this.getRealSizePerRendererSize();

    this.brushContext2d.lineWidth = this.size * this.getRealSizePerRendererSize();
    this.brushContext2d.strokeStyle = `rgb(${hexToRgb(this.color).join(' ')} / 70%)`;
    this.brushContext2d.lineCap = 'square';
    this.brushContext2d.lineJoin = 'miter';
    this.brushContext2d.filter = 'blur(10px)';

    if(this.memorizedDots[String(x)] && this.memorizedDots[String(y)]) {
      return;
    }

    this.memorizedDots[String(x)] = true;
    this.memorizedDots[String(y)] = true;

    this.brushContext2d.beginPath();
    this.brushContext2d.moveTo(this.lastX, this.lastY);
    this.brushContext2d.lineTo(x, y);
    this.brushContext2d.stroke();

    this.context2d.drawImage(this.brushCanvas, 0, 0, this.canvas.width, this.canvas.height);
    this.brushContext2d.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.lastX = x;
    this.lastY = y;
  }

  protected onTouchEnd() {
    this.isDrawing = false;
    this.brushContext2d.beginPath();
    this.lastX = this.lastY = undefined;
  }
}

export class ArrowPaintingLayer extends PaintingLayer {
  private stack: Array<{ x: number, y: number }> = [];

  private getDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.abs(x1 - x2) ** 2 + Math.abs(y1 - y2) ** 2);
  }

  protected draw(event: MouseEvent) {
    if(!this.isDrawing) {
      return;
    }

    super.draw(event);

    const bcr = (event.target as HTMLElement).getBoundingClientRect();
    const x = (event.clientX - bcr.left) * this.canvas.width / bcr.width;
    const y = (event.clientY - bcr.top) * this.canvas.height / bcr.height;

    if(this.stack.length < 3) {
      this.stack.unshift({x, y});
    } else if(this.getDistance(this.stack[0].x, this.stack[0].y, x, y) >= 4 * this.canvas.height / bcr.height) {
      this.stack.unshift({x, y});
    }
  };

  private getArrowPoints = (x: number, y: number, x1: number, y1: number) => {
    const PRIMARY_ANGLE = 30;
    const length = this.size * 4 * this.getRealSizePerRendererSize();

    const b = PRIMARY_ANGLE * Math.PI / 180 + Math.atan2(y1 - y, x1 - x);
    const b1 = (360 - PRIMARY_ANGLE) * Math.PI / 180 + Math.atan2(y1 - y, x1 - x);

    return [{
      x: x + Math.cos(b) * length,
      y: y + Math.sin(b) * length
    }, {
      x: x + Math.cos(b1) * length,
      y: y + Math.sin(b1) * length
    }];
  }

  protected onTouchEnd() {
    super.onTouchEnd();

    if(this.stack.length < 3) {
      return;
    }

    const {x, y} = this.stack[0];
    const {x: x1, y: y1} = this.stack.slice(0, Math.min(this.stack.length, 3)).reduce((prev, current) => {
      return {
        x: prev.x + current.x,
        y: prev.y + current.y
      }
    }, {x: 0, y: 0});
    const midX1 = x1 / Math.min(this.stack.length, 3);
    const mixY1 = y1 / Math.min(this.stack.length, 3);

    this.getArrowPoints(x, y, midX1, mixY1)
    .map(({
      x: arrowPointX,
      y: arrowPointY
    }) => {
      this.context2d.lineWidth = this.size * this.getRealSizePerRendererSize();
      this.context2d.strokeStyle = this.color;
      this.context2d.lineCap = 'round';
      this.context2d.beginPath();
      this.context2d.moveTo(x, y);
      this.context2d.lineTo(arrowPointX, arrowPointY);
      this.context2d.stroke();
      this.context2d.beginPath();
    })

    this.stack = [];
  }
}

export class NeonPaintingLayer extends PaintingLayer {
  neonCanvas: HTMLCanvasElement;
  neonContext2d: CanvasRenderingContext2D;
  hasBeginPath: boolean;

  override attach({
    renderedElement,
    canvas
  }: {
    renderedElement?: HTMLImageElement | HTMLCanvasElement,
    canvas?: HTMLCanvasElement
  }) {
    super.attach({renderedElement, canvas});
    this.context2d = this.canvas.getContext('2d');
    this.neonCanvas = document.createElement('canvas');
    this.neonCanvas.width = this.canvas.width;
    this.neonCanvas.height = this.canvas.height;
    this.neonContext2d = this.neonCanvas.getContext('2d');
  }

  protected draw(event: MouseEvent) {
    if(!this.isDrawing) {
      return;
    }

    const bcr = (event.target as HTMLElement).getBoundingClientRect();
    const x = (event.clientX - bcr.left) * this.canvas.width / bcr.width;
    const y = (event.clientY - bcr.top) * this.canvas.height / bcr.height;

    this.neonContext2d.lineWidth = (this.size + 5) * this.getRealSizePerRendererSize();
    this.neonContext2d.shadowBlur = (this.size) * this.getRealSizePerRendererSize();
    this.neonContext2d.shadowColor = this.color;
    this.neonContext2d.strokeStyle = `rgba(255 255 255 / 40%)`;
    this.neonContext2d.lineJoin = 'round';
    this.neonContext2d.lineCap = 'round';
    this.neonContext2d.lineTo(x, y);
    this.neonContext2d.stroke();
    this.neonContext2d.beginPath();
    this.neonContext2d.moveTo(x, y);

    this.context2d.drawImage(this.neonCanvas, 0, 0, this.canvas.width, this.canvas.height);
    this.neonContext2d.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.context2d.lineWidth = this.size * this.getRealSizePerRendererSize();
    this.context2d.strokeStyle = 'white';
    this.context2d.lineJoin = 'round';
    this.context2d.lineCap = 'round';
    if(!this.hasBeginPath) {
      this.context2d.beginPath();
      this.hasBeginPath = true;
    }
    this.context2d.lineTo(x, y);
    this.context2d.stroke();
    this.context2d.moveTo(x, y);
  };

  protected onTouchEnd() {
    super.onTouchEnd();
    this.neonContext2d.beginPath();

    this.hasBeginPath = false;
  }
}

export class BlurPaintingLayer extends PaintingLayer {
  blurCanvas: HTMLCanvasElement;
  blurContext2d: CanvasRenderingContext2D;
  highLevelCanvas: HTMLCanvasElement;
  highLevelContext2d: CanvasRenderingContext2D;
  hasBeginPath: boolean;
  lastX: number;
  lastY: number;

  override attach({
    renderedElement,
    canvas
  }: {
    renderedElement?: HTMLImageElement | HTMLCanvasElement,
    canvas?: HTMLCanvasElement
  }) {
    this.renderedElement = renderedElement;
    this.canvas = canvas;
    this.context2d = this.canvas.getContext('2d');

    this.blurCanvas = document.createElement('canvas');
    this.blurCanvas.width = this.canvas.width;
    this.blurCanvas.height = this.canvas.height;
    this.blurCanvas.style.position = 'absolute';
    this.blurCanvas.style.left = '0px';
    this.blurCanvas.style.top = '0px';
    this.blurCanvas.style.width = '100%';
    this.blurCanvas.style.height = '100%';
    this.blurCanvas.style.zIndex = '3';
    this.blurContext2d = this.blurCanvas.getContext('2d');

    this.highLevelCanvas = document.createElement('canvas');
    this.highLevelCanvas.width = this.canvas.width;
    this.highLevelCanvas.height = this.canvas.height;
    this.highLevelCanvas.style.position = 'absolute';
    this.highLevelCanvas.style.left = '0px';
    this.highLevelCanvas.style.top = '0px';
    this.highLevelCanvas.style.width = '100%';
    this.highLevelCanvas.style.height = '100%';
    this.highLevelCanvas.style.zIndex = '4';
    this.highLevelContext2d = this.highLevelCanvas.getContext('2d');

    const radius = 60;
    if(IS_CANVAS_FILTER_SUPPORTED) {
      this.blurContext2d.filter = `blur(${radius}px)`;
      this.blurContext2d.fillRect(-radius * 2, -radius * 2, this.canvas.width + radius * 4, this.canvas.height + radius * 4);
      this.blurContext2d.drawImage(this.renderedElement, -radius * 2, -radius * 2, this.canvas.width + radius * 4, this.canvas.height + radius * 4);
      this.blurContext2d.drawImage(this.canvas, -radius * 2, -radius * 2, this.canvas.width + radius * 4, this.canvas.height + radius * 4);
    } else {
      this.blurContext2d.drawImage(this.renderedElement, 0, 0, this.canvas.width, this.canvas.height);
      this.blurContext2d.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height);
      boxBlurCanvasRGB(this.blurContext2d, 0, 0, this.canvas.width, this.canvas.height, radius, 2);
    }

    this.highLevelContext2d.fillStyle = 'white';
    this.highLevelContext2d.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.highLevelContext2d.drawImage(this.renderedElement, 0, 0, this.canvas.width, this.canvas.height);
    this.highLevelContext2d.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height);

    this.renderedElement.parentElement.append(this.highLevelCanvas);
    this.renderedElement.parentElement.append(this.blurCanvas);

    this.highLevelCanvas.onmousedown = this.onTouchStart.bind(this);
    this.highLevelCanvas.onmouseup = this.onTouchEnd.bind(this);
    this.highLevelCanvas.onmouseleave = this.onTouchEnd.bind(this);
    this.highLevelCanvas.onmousemove = this.draw.bind(this);
  }

  override detach(): void {
    super.detach();
    this.highLevelCanvas.remove();
    this.blurCanvas.remove();
  }

  protected draw(event: MouseEvent) {
    if(!this.isDrawing) {
      return;
    }

    const bcr = (event.target as HTMLElement).getBoundingClientRect();

    const x = (event.clientX - bcr.left) * this.getRealSizePerRendererSize();
    const y = (event.clientY - bcr.top) * this.getRealSizePerRendererSize();

    this.highLevelContext2d.globalCompositeOperation = 'destination-out';
    this.highLevelContext2d.lineJoin = 'round';
    this.highLevelContext2d.lineCap = 'round';

    this.highLevelContext2d.beginPath();
    this.highLevelContext2d.arc(x, y, 10, 0, 2 * Math.PI);
    this.highLevelContext2d.fill();

    this.highLevelContext2d.lineWidth = this.size * this.getRealSizePerRendererSize();
    this.highLevelContext2d.beginPath();
    this.highLevelContext2d.moveTo(this.lastX, this.lastY);
    this.highLevelContext2d.lineTo(x, y);
    this.highLevelContext2d.stroke();

    this.lastX = (event.clientX - bcr.left) * this.getRealSizePerRendererSize();
    this.lastY = (event.clientY - bcr.top) * this.getRealSizePerRendererSize();
  };

  protected onTouchEnd() {
    super.onTouchEnd();
    this.highLevelContext2d.beginPath();
    this.lastX = undefined;
    this.lastY = undefined;

    const newCanvas = document.createElement('canvas');
    newCanvas.width = this.highLevelCanvas.width;
    newCanvas.height = this.highLevelCanvas.height;
    const ctx = newCanvas.getContext('2d');

    ctx.drawImage(this.blurCanvas, 0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.highLevelCanvas, 0, 0, this.canvas.width, this.canvas.height);

    const imageData = ctx.getImageData(0, 0, newCanvas.width, newCanvas.height);
    const highLevelCanvasImageData = this.highLevelContext2d.getImageData(0, 0, this.highLevelCanvas.width, this.highLevelCanvas.height);

    const data = imageData.data;
    const highLevelData = highLevelCanvasImageData.data;

    for(let i = 0; i < data.length; i += 4) {
      if(data[i + 3] === highLevelData[i + 3]) {
        data[i + 0] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    this.context2d.drawImage(newCanvas, 0, 0, newCanvas.width, newCanvas.height);
  }
}

export class EraserPaintingLayer extends PaintingLayer {
  blurCanvas: HTMLCanvasElement;
  blurContext2d: CanvasRenderingContext2D;
  hasBeginPath: boolean;
  lastX: number;
  lastY: number;
  prevGlobalCompositeOperation: GlobalCompositeOperation;

  override detach(): void {
    this.context2d.globalCompositeOperation = 'source-over';
    this.context2d.lineWidth = 0;
    super.detach();
  }

  protected draw(event: MouseEvent) {
    if(!this.isDrawing) {
      return;
    }

    const bcr = (event.target as HTMLElement).getBoundingClientRect();

    const x = (event.clientX - bcr.left) * this.getRealSizePerRendererSize();
    const y = (event.clientY - bcr.top) * this.getRealSizePerRendererSize();

    this.prevGlobalCompositeOperation = this.context2d.globalCompositeOperation;
    this.context2d.globalCompositeOperation = 'destination-out';
    this.context2d.lineJoin = 'round';
    this.context2d.lineCap = 'round';

    this.context2d.beginPath();
    this.context2d.arc(x, y, 10, 0, 2 * Math.PI);
    this.context2d.fill();

    this.context2d.lineWidth = this.size * this.getRealSizePerRendererSize();
    this.context2d.beginPath();
    this.context2d.moveTo(this.lastX, this.lastY);
    this.context2d.lineTo(x, y);
    this.context2d.stroke();

    this.lastX = (event.clientX - bcr.left) * this.canvas.width / bcr.width;
    this.lastY = (event.clientY - bcr.top) * this.canvas.height / bcr.height;
  };
}

export const brushItems: {
  value: string,
  Layer: typeof PaintingLayer,
  component: ({color}: BrashProps) => JSXElement
  active: boolean
}[] = [
  {
    value: 'Pen',
    Layer: PaintingLayer,
    component: Pen,
    active: false
  },
  {
    value: 'Arrow',
    Layer: ArrowPaintingLayer,
    component: Arrow,
    active: false
  },
  {
    value: 'Brush',
    Layer: PaintingLayerBrush,
    component: Brush,
    active: false
  },
  {
    value: 'Neon',
    Layer: NeonPaintingLayer,
    component: Neon,
    active: false
  },
  {
    value: 'Blur',
    Layer: BlurPaintingLayer,
    component: Blur,
    active: false
  },
  {
    value: 'Eraser',
    Layer: EraserPaintingLayer,
    component: Eraser,
    active: false
  }
]

export const BrushSelector = ({
  getBrash,
  setBrash
}: {
  getBrash: () => string,
  setBrash: (brash: string) => void
}) => {
  const [getBrushItems, setBrushItems] = createSignal(brushItems);

  createEffect(() => {
    const target = getBrash();

    if(target) {
      const index = brushItems.findIndex(({value}) => {
        return value.toLowerCase() === target.toLowerCase();
      })

      if(index > -1) {
        const newBrushItems = [...brushItems];
        newBrushItems[index] = {...brushItems[index], active: true};
        setBrushItems(newBrushItems);
      }
    }
  })

  return (
    <div class={'media-editor-brash-selector'}>
      <div class={'media-editor-header'}>
        {i18n('MediaEditor.tool')}
      </div>
      <For each={getBrushItems()}>
        {(item) => (
          <div
            class={classNames('media-editor-brash-selector-item', item.active && 'active')}
            onClick={() => setBrash(item.value)}
          >
            <div class={'media-editor-brash-selector-item-brush'}>
              <item.component />
            </div>
            <span class={'media-editor-brash-selector-item-text'}>
              {item.value}
            </span>
          </div>
        )}
      </For>
    </div>
  )
}
