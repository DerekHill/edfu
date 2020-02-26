import { Injectable, Inject } from '@nestjs/common';
import { TF_MODEL_NAME } from '../../constants';

@Injectable()
export class SimilarityService {
  constructor(@Inject(TF_MODEL_NAME) private readonly tfModel: any) {}

  async getSimilarity(sentence1: string, sentence2: string): Promise<number> {
    if (!sentence1 || !sentence2) {
      return 0;
    }
    const embeddings = await this.tfModel.embed([sentence1, sentence2]);
    const arrays = embeddings.arraySync();
    const similarity = this.dot_product(arrays[0], arrays[1]);
    console.log(
      `Similarity between "${sentence1}" and "${sentence2}" is ${similarity}`
    );
    return similarity;
  }

  private dot_product(vector1: number[], vector2: number[]) {
    let result = 0;
    for (let i = 0; i < vector1.length; i++) {
      result += vector1[i] * vector2[i];
    }
    return result;
  }
}

// Calling the following:

// import * as use from '@tensorflow-models/universal-sentence-encoder';
// use.load();

// Causes Jest to complain with:

// > Jest encountered an unexpected token
// >
// > This usually means that you are trying to import a file which Jest cannot parse, e.g. it's not plain JavaScript.
// >
// > By default, if Jest sees a Babel config, it will use that to transform your files, ignoring "node_modules".
// >
// > Here's what you can do:
// >  • To have some of your "node_modules" files transformed, you can specify a custom "transformIgnorePatterns" in your config.
// >  • If you need a custom transformation specify a "transform" option in your config.
// >  • If you simply want to mock your non-JS modules (e.g. binary assets) you can stub them out with the "moduleNameMapper" config option.
// >
// > You'll find more details and examples of these config options in the docs:
// > https://jestjs.io/docs/en/configuration.html

// Hence this service is not tested
