import AppGateway from './AppGateway';
import { render } from './testUtils';
describe("Our AppGateway component", () => {
	test("Does not crash on rendering", () => {
	  render(<AppGateway />);
	});
})
