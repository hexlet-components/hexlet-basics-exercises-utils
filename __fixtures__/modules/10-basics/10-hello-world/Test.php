<?php // phpcs:ignore PSR1.Files.SideEffects

namespace HexletBasics\Basics\HelloWorld;

use PHPUnit\Framework\TestCase;

\HexletBasics\Functions\runScript();

class Test extends TestCase
{
    public function test()
    {
        $expected = 'Hello, World!';
        $this->expectOutputString($expected);
        require 'index.php';
    }
}
