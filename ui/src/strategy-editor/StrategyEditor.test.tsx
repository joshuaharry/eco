import StrategyEditor from './StrategyEditor';
import { render } from '../testUtils';

describe("Our StrategyEditor component", () => {
	test("Does not crash on rendering", () => {
	  render(<StrategyEditor />);
	});
})
