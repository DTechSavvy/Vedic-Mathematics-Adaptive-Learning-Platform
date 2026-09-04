import { Injectable, Logger } from '@nestjs/common';
import { MathVerificationResult } from '../interfaces/math-verification.interface';

type TokenType = 'NUMBER' | 'OP' | 'LPAREN' | 'RPAREN' | 'SQRT';

interface Token {
  type: TokenType;
  value: string | number;
}

@Injectable()
export class MathSolverService {
  private readonly logger = new Logger(MathSolverService.name);

  /**
   * Safe evaluation of mathematical expressions without eval()
   */
  evaluate(expression: string): number | null {
    try {
      const sanitized = this.sanitizeExpression(expression);
      if (!sanitized) return null;

      const tokens = this.tokenize(sanitized);
      if (!tokens || tokens.length === 0) return null;

      const parser = new SafeParser(tokens);
      const result = parser.parse();

      if (isNaN(result) || !isFinite(result)) {
        return null;
      }

      // Round to 6 decimal places to prevent floating point inaccuracies like 0.000000000000001
      return Math.round(result * 1e6) / 1e6;
    } catch (err: any) {
      this.logger.debug(
        `Math parsing error for "${expression}": ${err.message}`,
      );
      return null;
    }
  }

  /**
   * Deterministically verify student answer against evaluated expression
   */
  verify(
    expression: string,
    studentAnswer: string | number | null | undefined,
  ): MathVerificationResult {
    const parsedResult = this.evaluate(expression);

    if (parsedResult === null) {
      return {
        expression,
        parsedResult: null,
        studentAnswer: studentAnswer != null ? String(studentAnswer) : null,
        isCorrect: null,
        success: false,
        error: 'Unable to deterministically evaluate expression',
      };
    }

    if (
      studentAnswer === null ||
      studentAnswer === undefined ||
      String(studentAnswer).trim() === ''
    ) {
      return {
        expression,
        parsedResult,
        studentAnswer: null,
        isCorrect: null,
        success: true,
      };
    }

    const studentNum = Number(String(studentAnswer).trim());
    if (isNaN(studentNum)) {
      return {
        expression,
        parsedResult,
        studentAnswer: String(studentAnswer),
        isCorrect: false,
        success: true,
        error: 'Student answer is not a valid number',
      };
    }

    const diff = Math.abs(studentNum - parsedResult);
    const isCorrect = diff < 1e-5;

    return {
      expression,
      parsedResult,
      studentAnswer: String(studentAnswer),
      isCorrect,
      difference: diff,
      success: true,
    };
  }

  private sanitizeExpression(raw: string): string {
    return raw
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/√\s*(\d+)/g, 'sqrt($1)')
      .replace(/sqrt\s+(\d+)/gi, 'sqrt($1)')
      .replace(/\s+/g, '')
      .trim();
  }

  private tokenize(expr: string): Token[] | null {
    const tokens: Token[] = [];
    let i = 0;

    while (i < expr.length) {
      const char = expr[i];

      if (char === '(') {
        tokens.push({ type: 'LPAREN', value: '(' });
        i++;
        continue;
      }

      if (char === ')') {
        tokens.push({ type: 'RPAREN', value: ')' });
        i++;
        continue;
      }

      if (['+', '-', '*', '/', '^'].includes(char)) {
        tokens.push({ type: 'OP', value: char });
        i++;
        continue;
      }

      if (expr.substring(i, i + 4).toLowerCase() === 'sqrt') {
        tokens.push({ type: 'SQRT', value: 'sqrt' });
        i += 4;
        continue;
      }

      if (/\d/.test(char) || (char === '.' && /\d/.test(expr[i + 1] || ''))) {
        let numStr = '';
        while (i < expr.length && /[\d\.]/.test(expr[i])) {
          numStr += expr[i];
          i++;
        }
        const num = Number(numStr);
        if (isNaN(num)) return null;
        tokens.push({ type: 'NUMBER', value: num });
        continue;
      }

      // Unexpected character
      return null;
    }

    return tokens;
  }
}

/**
 * Safe Recursive Descent Parser implementing standard arithmetic grammar:
 * Expression := Term (('+' | '-') Term)*
 * Term       := Factor (('*' | '/') Factor)*
 * Factor     := Power ('^' Power)*
 * Power      := ('-')? Primary
 * Primary    := NUMBER | '(' Expression ')' | 'sqrt' '(' Expression ')'
 */
class SafeParser {
  private pos = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): number {
    const result = this.parseExpression();
    if (this.pos < this.tokens.length) {
      throw new Error(
        `Unexpected token at position ${this.pos}: ${JSON.stringify(this.tokens[this.pos])}`,
      );
    }
    return result;
  }

  private parseExpression(): number {
    let result = this.parseTerm();

    while (this.pos < this.tokens.length) {
      const token = this.tokens[this.pos];
      if (token.type === 'OP' && (token.value === '+' || token.value === '-')) {
        this.pos++;
        const right = this.parseTerm();
        result = token.value === '+' ? result + right : result - right;
      } else {
        break;
      }
    }

    return result;
  }

  private parseTerm(): number {
    let result = this.parseFactor();

    while (this.pos < this.tokens.length) {
      const token = this.tokens[this.pos];
      if (token.type === 'OP' && (token.value === '*' || token.value === '/')) {
        this.pos++;
        const right = this.parseFactor();
        if (token.value === '/') {
          if (right === 0) throw new Error('Division by zero');
          result = result / right;
        } else {
          result = result * right;
        }
      } else {
        break;
      }
    }

    return result;
  }

  private parseFactor(): number {
    let base = this.parsePower();

    while (this.pos < this.tokens.length) {
      const token = this.tokens[this.pos];
      if (token.type === 'OP' && token.value === '^') {
        this.pos++;
        const exp = this.parsePower();
        base = Math.pow(base, exp);
      } else {
        break;
      }
    }

    return base;
  }

  private parsePower(): number {
    if (this.pos < this.tokens.length) {
      const token = this.tokens[this.pos];
      if (token.type === 'OP' && token.value === '-') {
        this.pos++;
        return -this.parsePrimary();
      }
      if (token.type === 'OP' && token.value === '+') {
        this.pos++;
        return this.parsePrimary();
      }
    }
    return this.parsePrimary();
  }

  private parsePrimary(): number {
    if (this.pos >= this.tokens.length) {
      throw new Error('Unexpected end of expression');
    }

    const token = this.tokens[this.pos];

    if (token.type === 'NUMBER') {
      this.pos++;
      return token.value as number;
    }

    if (token.type === 'SQRT') {
      this.pos++;
      if (
        this.pos >= this.tokens.length ||
        this.tokens[this.pos].type !== 'LPAREN'
      ) {
        throw new Error('Expected ( after sqrt');
      }
      this.pos++; // skip (
      const inner = this.parseExpression();
      if (
        this.pos >= this.tokens.length ||
        this.tokens[this.pos].type !== 'RPAREN'
      ) {
        throw new Error('Expected ) after sqrt expression');
      }
      this.pos++; // skip )
      if (inner < 0) throw new Error('Square root of negative number');
      return Math.sqrt(inner);
    }

    if (token.type === 'LPAREN') {
      this.pos++;
      const result = this.parseExpression();
      if (
        this.pos >= this.tokens.length ||
        this.tokens[this.pos].type !== 'RPAREN'
      ) {
        throw new Error('Missing closing parenthesis');
      }
      this.pos++; // skip )
      return result;
    }

    throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
  }
}
