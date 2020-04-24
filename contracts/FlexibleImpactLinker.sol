pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./ImpactRegistry.sol";
import "./ImpactLinker.sol";


contract FlexibleImpactLinker is ImpactLinker {
    using SafeMath for uint256;

    uint256 public unit;

    /* Structures that store a match between validated outcome and donations */
    mapping(bytes32 => ImpactRegistry.Impact) impact;
    mapping(bytes32 => uint256) linkingCursors;

    constructor(ImpactRegistry _impactRegistry, uint256 _unit)
        public
        ImpactLinker(_impactRegistry)
    {
        unit = _unit;
    }

    function updateUnit(uint256 _value) public onlyOwner {
        unit = _value;
    }

    function linkImpact(bytes32 _claimId) external onlyRegistry {
        uint256 value = registry.getImpactTotalValue(_claimId);
        uint256 linked = registry.getImpactLinked(_claimId);
        uint256 left = value.sub(linked);

        if (left > 0) {
            uint256 i = linkingCursors[_claimId];
            address account = registry.getAccount(i);
            uint256 balance = registry.getBalance(account);
            if (balance >= 0) {
                //Calculate impact
                uint256 impactVal = balance;
                if (impactVal > left) {
                    impactVal = left;
                }
                if (impactVal > unit) {
                    impactVal = unit;
                }

                registry.registerImpact(_claimId, i, impactVal);

                //Update cursor
                if (balance == impactVal) {
                    i--;
                }

                uint256 accountsCount = registry.getAccountsCount();
                if (accountsCount > 0) {
                    linkingCursors[_claimId] = (i + 1) % accountsCount;
                } else {
                    linkingCursors[_claimId] = 0;
                }
            }
        }
    }
}
