/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			'brand': {
  				'green': {
  					DEFAULT: '#0F5132',
  					light: '#90C290',
  				},
  				'black': '#000000',
  				'brown': '#654321',
  				'cream': '#FFFDF7',
  			},
  			primary: {
  				DEFAULT: '#0F5132',
  				foreground: '#FFFFFF',
  			},
  			secondary: {
  				DEFAULT: '#654321',
  				foreground: '#FFFFFF',
  			},
  			accent: {
  				DEFAULT: '#90C290',
  				foreground: '#000000',
  			},
  			background: {
  				DEFAULT: '#FFFDF7',
  				darker: '#F5F5F5',
  			},
  			foreground: '#000000',
  			card: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#000000',
  			},
  			popover: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#000000',
  			},
  			muted: {
  				DEFAULT: '#F5F5F5',
  				foreground: '#666666',
  			},
  			destructive: {
  				DEFAULT: '#EF4444',
  				foreground: '#FFFFFF',
  			},
  			border: '#E5E7EB',
  			input: '#E5E7EB',
  			ring: '#0F5132',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: 0
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: 0
  				}
  			},
  			shake: {
  				'0%': { transform: 'translateX(0)' },
  				'25%': { transform: 'translateX(-4px)' },
  				'75%': { transform: 'translateX(4px)' },
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'shake': 'shake 0.5s ease-in-out',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

