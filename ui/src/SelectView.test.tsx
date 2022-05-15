import SelectView from './SelectView';
import { render } from './testUtils';
describe("Our SelectView component", () => {
	test("Does not crash on rendering", () => {
	  render(<SelectView />);
	});
})
