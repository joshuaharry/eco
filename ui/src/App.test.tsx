import App from './App';
import { render } from './testUtils';
describe("Our App component", () => {
	test("Does not crash on rendering", () => {
	  render(<App />);
	});
})
