import Card from './Card';
import { render } from './testUtils';
describe("Our Card component", () => {
	test("Does not crash on rendering", () => {
	  render(<Card />);
	});
})
