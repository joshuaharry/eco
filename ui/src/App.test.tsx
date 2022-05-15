import App from './App';
import { render } from '@testing-library/react';

describe("Our App component", () => {
	test("Does not crash on rendering", () => {
	  render(<App />);
	});
})
