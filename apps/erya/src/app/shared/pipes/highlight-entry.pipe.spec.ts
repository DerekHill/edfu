import { HighlightEntryPipe } from './highlight-entry.pipe';

fdescribe('HighlightSignPipe', () => {
  it('create an instance', () => {
    const pipe = new HighlightEntryPipe();
    expect(pipe).toBeTruthy();
  });

  it('should highlight sign word', () => {
    const signExample = 'Melissa came in looking happy and excited';
    const sign = 'happy'
    const pipe = new HighlightEntryPipe();

    const result = pipe.transform(signExample, sign);

    expect(result).toBe(
      `‘Melissa came in looking <span class="has-text-weight-bold">happy</span> and excited’`
    );

  });
});
