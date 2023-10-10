// react needs to support all of the vanilla js examples

const html = `
<p class="group block max-w-xs mx-auto rounded-lg p-6 bg-[#424242] ring-1 ring-slate-900/5 shadow-lg space-y-3 hover:bg-sky-500 hover:ring-sky-500 border-[3px]">
	PHP Regex should be able to match the class property on this element
</p>
<p class=" min-h-screen flex w-full justify-center p-2 bg-[#165f67]">
	This has a class property that has tripped up the regex in the past, so we're testing it here for regression.
</p>`;

{
	const className = 'group block max-w-xs mx-auto rounded-lg p-6 bg-[#424242] ring-1 ring-slate-900/5 shadow-lg space-y-3 hover:bg-sky-500 hover:ring-sky-500 border-[3px]';
	const tw = 'group block max-w-xs mx-auto rounded-lg p-6 bg-[#424242] ring-1 ring-slate-900/5 shadow-lg space-y-3 hover:bg-sky-500 hover:ring-sky-500 border-[3px] min-h-screen flex w-full justify-center p-2 bg-[#165f67]';
}

{
	const className = 'min-h-screen flex w-full justify-center p-2 bg-[#165f67]';
	const tw = 'min-h-screen flex w-full justify-center p-2 bg-[#165f67]';
}

// React also needs to support uses of JSX

const p1 = <p className={'group block max-w-xs mx-auto rounded-lg p-6 bg-[#424242] ring-1 ring-slate-900/5 shadow-lg space-y-3 hover:bg-sky-500 hover:ring-sky-500 border-[3px]'}>
	PHP Regex should be able to match the class property on this element
</p>;
const p2 = <p className={'min-h-screen flex w-full justify-center p-2 bg-[#165f67]'}></p>

const p3 = <p className='group block max-w-xs mx-auto rounded-lg p-6 bg-[#424242] ring-1 ring-slate-900/5 shadow-lg space-y-3 hover:bg-sky-500 hover:ring-sky-500 border-[3px] min-h-screen flex w-full justify-center p-2 bg-[#165f67]'></p>
const p4 = <p className='min-h-screen flex w-full justify-center p-2 bg-[#165f67]'></p>

const p5 = <p className="group block max-w-xs mx-auto rounded-lg p-6 bg-[#424242] ring-1 ring-slate-900/5 shadow-lg space-y-3 hover:bg-sky-500 hover:ring-sky-500 border-[3px] min-h-screen flex w-full justify-center p-2 bg-[#165f67]"></p>
const p6 = <p className="min-h-screen flex w-full justify-center p-2 bg-[#165f67]"></p>

// TODO: gather more real-world examples of classnames in react