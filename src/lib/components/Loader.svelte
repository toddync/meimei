<!--* Most surely not the final loader -->
<svg class="w-full aspect-square hand" viewBox="0 0 32 20">
	<clipPath id="finger-pinky">
		<rect rx="2.5" ry="2.5" width="6" height="15" />
	</clipPath>
	<clipPath id="finger-ring">
		<rect rx="2.5" ry="2.5" width="6" height="18" />
	</clipPath>
	<clipPath id="finger-middle">
		<rect rx="2.5" ry="2.5" width="6" height="20" />
	</clipPath>
	<clipPath id="finger-index">
		<rect rx="2.5" ry="2.5" width="6" height="17" />
	</clipPath>
	<clipPath id="finger-thumb">
		<rect width="6" height="15.2" />
	</clipPath>
	<g
		class="hand__finger hand__finger--pinky"
		transform="translate(0,3.5)"
		clip-path="url(#finger-pinky)"
	>
		<g class="hand__finger-inner">
			<rect class="hand__skin" rx="2.5" ry="2.5" width="6" height="15" />
			<rect rx="0.25" ry="0.25" width="3" height="0.5" x="1.5" y="1.5" />
			<rect rx="0.25" ry="0.25" width="3" height="0.5" x="1.5" y="2.5" />
			<path
				class="hand__nail"
				d="M 2 10 H 4 A 1 1 0 0 1 5 11 V 12 A 2 2 0 0 1 3 14 H 3 A 2 2 0 0 1 1 12 V 11 A 1 1 0 0 1 2 10 Z"
			/>
		</g>
	</g>
	<g
		class="hand__finger--ring hand__finger"
		transform="translate(6.5,1.8)"
		clip-path="url(#finger-ring)"
	>
		<g class="hand__finger-inner">
			<rect class="hand__skin" rx="2.5" ry="2.5" width="6" height="18" />
			<rect rx="0.25" ry="0.25" width="3" height="0.5" x="1.5" y="1.5" />
			<rect rx="0.25" ry="0.25" width="3" height="0.5" x="1.5" y="2.5" />
			<path
				class="hand__nail"
				d="M 2 13 H 4 A 1 1 0 0 1 5 14 V 15 A 2 2 0 0 1 3 17 H 3 A 2 2 0 0 1 1 15 V 14 A 1 1 0 0 1 2 13 Z"
			/>
		</g>
	</g>
	<g
		class="hand__finger hand__finger--middle"
		transform="translate(13,0)"
		clip-path="url(#finger-middle)"
	>
		<g class="hand__finger-inner">
			<rect class="hand__skin" rx="2.5" ry="2.5" width="6" height="20" />
			<rect rx="0.25" ry="0.25" width="3" height="0.5" x="1.5" y="1.5" />
			<rect rx="0.25" ry="0.25" width="3" height="0.5" x="1.5" y="2.5" />
			<path
				class="hand__nail"
				d="M 2 15 H 4 A 1 1 0 0 1 5 16 V 17 A 2 2 0 0 1 3 19 H 3 A 2 2 0 0 1 1 17 V 16 A 1 1 0 0 1 2 15 Z"
			/>
		</g>
	</g>
	<g
		class="hand__finger hand__finger--index"
		transform="translate(19.5,2.5)"
		clip-path="url(#finger-index)"
	>
		<g class="hand__finger-inner">
			<rect class="hand__skin" rx="2.5" ry="2.5" width="6" height="17" />
			<rect rx="0.25" ry="0.25" width="3" height="0.5" x="1.5" y="1.5" />
			<rect rx="0.25" ry="0.25" width="3" height="0.5" x="1.5" y="2.5" />
			<path
				class="hand__nail"
				d="M 2 12 H 4 A 1 1 0 0 1 5 13 V 14 A 2 2 0 0 1 3 16 H 3 A 2 2 0 0 1 1 14 V 13 A 1 1 0 0 1 2 12 Z"
			/>
		</g>
	</g>
	<g
		class="hand__finger hand__finger--thumb"
		transform="translate(26,0)"
		clip-path="url(#finger-thumb)"
	>
		<g class="hand__finger-inner">
			<path
				class="hand__skin"
				d="M 0 0 C 0 0 0.652 0.986 1.494 1.455 C 2.775 2.169 6 0.763 6 3.018 C 6 5.197 4.62 7 2.61 7 C 1.495 7 0 7 0 7 L 0 0 Z"
				transform="translate(0,8.2)"
			/>
		</g>
	</g>
</svg>

<style>
	:root {
		--hue: 223;
		--sat: 10%;
		--gray0: hsl(0, 0%, 100%);
		--gray1: hsl(var(--hue), var(--sat), 90%);
		--gray2: hsl(var(--hue), var(--sat), 80%);
		--gray3: hsl(var(--hue), var(--sat), 70%);
		--gray4: hsl(var(--hue), var(--sat), 60%);
		--gray5: hsl(var(--hue), var(--sat), 50%);
		--gray6: hsl(var(--hue), var(--sat), 40%);
		--gray7: hsl(var(--hue), var(--sat), 30%);
		--gray8: hsl(var(--hue), var(--sat), 20%);
		--gray9: hsl(var(--hue), var(--sat), 10%);
		--trans-dur: 0.3s;
		font-size: clamp(1rem, 0.95rem + 0.25vw, 1.25rem);
	}

	.hand {
		--anim-dur: 1s;
		--anim-timing: cubic-bezier(0.65, 0, 0.35, 1);
		display: block;
		margin: auto;
	}
	.hand__finger,
	.hand__finger-inner {
		animation-duration: var(--anim-dur);
		animation-timing-function: var(--anim-timing);
		animation-iteration-count: infinite;
	}
	.hand__finger-inner {
		animation-name: finger-inner;
		fill: var(--gray4);
	}
	.hand__finger--pinky {
		animation-name: pinky;
	}
	.hand__finger--pinky,
	.hand__finger--pinky .hand__finger-inner {
		animation-delay: calc(var(--anim-dur) * 0.16);
	}
	.hand__finger--ring {
		animation-name: ring;
	}
	.hand__finger--ring,
	.hand__finger--ring .hand__finger-inner {
		animation-delay: calc(var(--anim-dur) * 0.12);
	}
	.hand__finger--middle .hand__finger-inner {
		animation-delay: calc(var(--anim-dur) * 0.08);
	}
	.hand__finger--index {
		animation-name: index;
	}
	.hand__finger--index,
	.hand__finger--index .hand__finger-inner {
		animation-delay: calc(var(--anim-dur) * 0.04);
	}
	.hand__finger--thumb .hand__finger-inner {
		animation-name: thumb-inner;
	}
	.hand__finger-inner,
	.hand__nail,
	.hand__skin {
		transition: fill var(--trans-dur);
	}
	.hand__nail {
		fill: var(--gray0);
	}
	.hand__skin {
		fill: var(--gray2);
	}

	/* Dark theme */
	@media (prefers-color-scheme: dark) {
		/* body {
			background-color: var(--gray9);
			color: var(--gray1);
		} */

		.hand__finger-inner {
			fill: var(--gray9);
		}
		.hand__nail {
			fill: var(--gray5);
		}
		.hand__skin {
			fill: var(--gray7);
		}
	}
	/* Animations */
	@keyframes finger-inner {
		from,
		80%,
		to {
			transform: translate(0, 0);
		}
		40% {
			animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0);
			transform: translate(0, -3px);
		}
	}
	@keyframes thumb-inner {
		from,
		80%,
		to {
			transform: translate(0, 0) skewY(0);
		}
		40% {
			animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0);
			transform: translate(-0.5px, -3px) skewY(-15deg);
		}
	}
	@keyframes pinky {
		from,
		80%,
		to {
			transform: translate(0, 3.5px);
		}
		40% {
			animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0);
			transform: translate(0, 1.2px);
		}
	}
	@keyframes ring {
		from,
		80%,
		to {
			transform: translate(6.5px, 1.8px);
		}
		40% {
			animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0);
			transform: translate(6.5px, 0.5px);
		}
	}
	@keyframes index {
		from,
		80%,
		to {
			transform: translate(19.5px, 2.5px);
		}
		40% {
			animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0);
			transform: translate(19.5px, 1.2px);
		}
	}
</style>
