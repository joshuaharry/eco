import Container from './Container';
import { render } from './testUtils';
describe("Our Container component", () => {
	test("Does not crash on rendering", () => {
	  render(<Container />);
	});
})
