# hostname 추출 함수가 두 기능에 중복돼 있음

- **증상**: `features/saved-articles/article-list.tsx`의 `hostnameOf`가 `features/url-to-markdown/export.ts`의 `hostnameOf`와 똑같습니다.
- **근거**: `saved-articles` 구현 PR의 `code-review low` 지적입니다. 두 함수의 본문이 같습니다.
- **추정 원인**: 같은 급의 기능 모듈이 서로를 import하지 않게 하려고 복사했습니다(AGENTS.md 원칙 3).
- **시도한 것**: 없습니다. 수용 기준에 영향이 없어서 이번 범위에서 고치지 않았습니다.
- **다음 단계**: 세 번째 사용처가 생기거나 한쪽을 바꿔야 할 때 `lib/`로 내리고 두 기능이 그것을 쓰게 합니다.
