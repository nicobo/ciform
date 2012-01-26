
/**
 * A rewrite of the "sha1_vm_test" found in the library itself
 */
function testHexSHA1()
{
    assertEquals( "Performs a simple self-test to see if the VM is working", "a9993e364706816aba3e25717850c26c9cd0d89d", hex_sha1("abc") );
}
