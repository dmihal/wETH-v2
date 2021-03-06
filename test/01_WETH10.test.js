const WETH10 = artifacts.require('WETH10')

const { BN, expectRevert } = require('@openzeppelin/test-helpers')
require('chai').use(require('chai-as-promised')).should()

contract('TestOracle', (accounts) => {
  const [deployer, user1, user2] = accounts
  let weth

  beforeEach(async () => {
    weth = await WETH10.new({ from: deployer })
  })

  describe('deployment', async () => {
    it('returns the name', async () => {
      let name = await weth.name()
      name.should.equal('Wrapped Ether')
    })

    it('deposits ether', async () => {
      const balanceBefore = await weth.balanceOf(user1)
      await weth.deposit({ from: user1, value: 1 })
      const balanceAfter = await weth.balanceOf(user1)
      balanceAfter.toString().should.equal(balanceBefore.add(new BN('1')).toString())
    })

    describe('with a positive balance', async () => {
      beforeEach(async () => {
        await weth.deposit({ from: user1, value: 1 })
      })

      it('withdraws ether', async () => {
        const balanceBefore = await weth.balanceOf(user1)
        await weth.withdraw(1, { from: user1 })
        const balanceAfter = await weth.balanceOf(user1)
        balanceAfter.toString().should.equal(balanceBefore.sub(new BN('1')).toString())
      })

      it('transfers ether', async () => {
        const balanceBefore = await weth.balanceOf(user2)
        await weth.transfer(user2, 1, { from: user1 })
        const balanceAfter = await weth.balanceOf(user2)
        balanceAfter.toString().should.equal(balanceBefore.add(new BN('1')).toString())
      })

      it('transfers ether using transferFrom', async () => {
        const balanceBefore = await weth.balanceOf(user2)
        await weth.transferFrom(user1, user2, 1, { from: user1 })
        const balanceAfter = await weth.balanceOf(user2)
        balanceAfter.toString().should.equal(balanceBefore.add(new BN('1')).toString())
      })

      it('approves to increase allowance', async () => {
        const allowanceBefore = await weth.allowance(user1, user2)
        await weth.approve(user2, 1, { from: user1 })
        const allowanceAfter = await weth.allowance(user1, user2)
        allowanceAfter.toString().should.equal(allowanceBefore.add(new BN('1')).toString())
      })

      describe('with a positive balance', async () => {
        beforeEach(async () => {
          await weth.approve(user2, 1, { from: user1 })
        })

        it('transfers ether using transferFrom and allowance', async () => {
          const balanceBefore = await weth.balanceOf(user2)
          await weth.transferFrom(user1, user2, 1, { from: user2 })
          const balanceAfter = await weth.balanceOf(user2)
          balanceAfter.toString().should.equal(balanceBefore.add(new BN('1')).toString())
        })
      })
    })
  })
})
